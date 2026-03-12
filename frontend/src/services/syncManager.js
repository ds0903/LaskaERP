import axios from 'axios'
import { getDb } from '../db/index'

const SERVER = 'http://127.0.0.1:8000'
const http = axios.create({ baseURL: SERVER, timeout: 5000 })

export async function checkServerOnline() {
  try {
    await http.get('/api/warehouse/warehouses')
    return true
  } catch {
    return false
  }
}

// Повна синхронізація: спочатку відправити чергу, потім витягнути свіжі дані
export async function syncAll(onStatusChange) {
  const online = await checkServerOnline()
  if (!online) return { online: false, synced: 0 }

  const db = await getDb()
  let synced = 0

  // --- Відправити чергу на сервер ---
  const queue = await db.select('SELECT * FROM sync_queue ORDER BY id ASC')

  for (const op of queue) {
    try {
      const payload = JSON.parse(op.payload)
      await flushOp(db, op.entity, op.operation, op.local_id, payload)
      await db.execute('DELETE FROM sync_queue WHERE id = ?', [op.id])
      synced++
    } catch (err) {
      await db.execute('UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?', [op.id])
      // видалити якщо занадто багато спроб (конфлікт/помилка даних)
      if (op.attempts >= 5) {
        await db.execute('DELETE FROM sync_queue WHERE id = ?', [op.id])
      }
    }
  }

  // --- Витягнути свіжі дані з сервера ---
  await pullFromServer(db)

  return { online: true, synced }
}

async function flushOp(db, entity, operation, localId, payload) {
  const routes = {
    warehouse: '/api/warehouse/warehouses',
    product: '/api/warehouse/products',
    movement: '/api/warehouse/movements',
  }
  const base = routes[entity]

  if (operation === 'create') {
    const { data } = await http.post(base, payload)
    // оновити server_id у локальній таблиці
    const table = entity === 'warehouse' ? 'warehouses' : entity === 'product' ? 'products' : null
    if (table) {
      await db.execute(
        `UPDATE ${table} SET server_id = ?, _dirty = 0 WHERE id = ?`,
        [data.id, localId]
      )
    }
  } else if (operation === 'update') {
    const table = entity === 'warehouse' ? 'warehouses' : 'products'
    const row = await db.select(`SELECT server_id FROM ${table} WHERE id = ?`, [localId])
    const serverId = row[0]?.server_id
    if (serverId) {
      await http.patch(`${base}/${serverId}`, payload)
      await db.execute(`UPDATE ${table} SET _dirty = 0 WHERE id = ?`, [localId])
    }
  } else if (operation === 'delete') {
    const table = entity === 'warehouse' ? 'warehouses' : 'products'
    const row = await db.select(`SELECT server_id FROM ${table} WHERE id = ?`, [localId])
    const serverId = row[0]?.server_id
    if (serverId) await http.delete(`${base}/${serverId}`)
  }
}

async function pullFromServer(db) {
  const [warehouses, products, stock] = await Promise.all([
    http.get('/api/warehouse/warehouses').then(r => r.data),
    http.get('/api/warehouse/products').then(r => r.data),
    http.get('/api/warehouse/stock').then(r => r.data),
  ])

  for (const w of warehouses) {
    await db.execute(
      `INSERT INTO warehouses (id, name, address, description, created_at, server_id, _dirty)
       VALUES (?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, address=excluded.address,
         description=excluded.description, _dirty=0`,
      [String(w.id), w.name, w.address, w.description, w.created_at, w.id]
    )
  }

  for (const p of products) {
    await db.execute(
      `INSERT INTO products (id, name, sku, unit, description, price, category, created_at, server_id, _dirty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, sku=excluded.sku, unit=excluded.unit,
         price=excluded.price, category=excluded.category, _dirty=0`,
      [String(p.id), p.name, p.sku, p.unit, p.description, p.price, p.category, p.created_at, p.id]
    )
  }

  for (const s of stock) {
    await db.execute(
      `INSERT INTO stock_items (id, warehouse_id, product_id, quantity)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET quantity=excluded.quantity`,
      [
        `${s.warehouse_id}_${s.product_id}`,
        String(s.warehouse_id),
        String(s.product_id),
        s.quantity,
      ]
    )
  }
}
