import { getDb, localId } from '../db/index'

const now = () => new Date().toISOString()

// ─── Warehouses ───────────────────────────────────────────────

export async function getWarehouses() {
  const db = await getDb()
  return db.select('SELECT * FROM warehouses ORDER BY rowid')
}

export async function createWarehouse(data) {
  const db = await getDb()
  const id = localId()
  await db.execute(
    `INSERT INTO warehouses (id, name, address, description, created_at, _dirty)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [id, data.name, data.address ?? null, data.description ?? null, now()]
  )
  await enqueue(db, 'warehouse', 'create', id, data)
  return { id, ...data, created_at: now() }
}

export async function updateWarehouse(id, data) {
  const db = await getDb()
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  await db.execute(
    `UPDATE warehouses SET ${sets}, _dirty = 1 WHERE id = ?`,
    [...Object.values(data), id]
  )
  await enqueue(db, 'warehouse', 'update', id, data)
}

export async function deleteWarehouse(id) {
  const db = await getDb()
  await db.execute('DELETE FROM warehouses WHERE id = ?', [id])
  await enqueue(db, 'warehouse', 'delete', id, {})
}

// ─── Products ────────────────────────────────────────────────

export async function getProducts() {
  const db = await getDb()
  return db.select('SELECT * FROM products ORDER BY rowid')
}

export async function createProduct(data) {
  const db = await getDb()
  const id = localId()
  await db.execute(
    `INSERT INTO products (id, name, sku, unit, description, price, category, created_at, _dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [id, data.name, data.sku, data.unit ?? 'шт', data.description ?? null,
     data.price ?? 0, data.category ?? null, now()]
  )
  await enqueue(db, 'product', 'create', id, data)
  return { id, ...data, created_at: now() }
}

export async function updateProduct(id, data) {
  const db = await getDb()
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  await db.execute(
    `UPDATE products SET ${sets}, _dirty = 1 WHERE id = ?`,
    [...Object.values(data), id]
  )
  await enqueue(db, 'product', 'update', id, data)
}

export async function deleteProduct(id) {
  const db = await getDb()
  await db.execute('DELETE FROM products WHERE id = ?', [id])
  await enqueue(db, 'product', 'delete', id, {})
}

// ─── Stock ───────────────────────────────────────────────────

export async function getStock(warehouseId) {
  const db = await getDb()
  const query = warehouseId
    ? `SELECT s.*, p.name as product_name, p.sku, p.unit,
              w.name as warehouse_name
       FROM stock_items s
       JOIN products p ON p.id = s.product_id
       JOIN warehouses w ON w.id = s.warehouse_id
       WHERE s.warehouse_id = ?`
    : `SELECT s.*, p.name as product_name, p.sku, p.unit,
              w.name as warehouse_name
       FROM stock_items s
       JOIN products p ON p.id = s.product_id
       JOIN warehouses w ON w.id = s.warehouse_id`

  const rows = warehouseId
    ? await db.select(query, [warehouseId])
    : await db.select(query)

  // нормалізуємо до того ж формату що очікують компоненти
  return rows.map(r => ({
    id: r.id,
    warehouse_id: r.warehouse_id,
    product_id: r.product_id,
    quantity: r.quantity,
    product: { id: r.product_id, name: r.product_name, sku: r.sku, unit: r.unit },
    warehouse: { id: r.warehouse_id, name: r.warehouse_name },
  }))
}

// ─── Movements ───────────────────────────────────────────────

export async function getMovements(params = {}) {
  const db = await getDb()
  // рухи зберігаємо тільки на сервері; локально показуємо з queue
  const queue = await db.select(
    `SELECT * FROM sync_queue WHERE entity = 'movement' ORDER BY id DESC`
  )
  return queue.map(q => {
    const p = JSON.parse(q.payload)
    return {
      id: q.id,
      warehouse_id: p.warehouse_id,
      product_id: p.product_id,
      movement_type: p.movement_type,
      quantity: p.quantity,
      reason: p.reason ?? null,
      created_at: q.created_at,
      _pending: true,
    }
  })
}

export async function createMovement(data) {
  const db = await getDb()
  const stockId = `${data.warehouse_id}_${data.product_id}`

  // перевірка наявності (тільки для OUT)
  if (data.movement_type === 'out') {
    const rows = await db.select(
      'SELECT quantity FROM stock_items WHERE id = ?', [stockId]
    )
    const current = rows[0]?.quantity ?? 0
    if (current < data.quantity) {
      throw new Error('Недостатньо товару на складі')
    }
  }

  // оновити локальний залишок
  if (data.movement_type === 'in') {
    await db.execute(
      `INSERT INTO stock_items (id, warehouse_id, product_id, quantity)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET quantity = quantity + excluded.quantity`,
      [stockId, String(data.warehouse_id), String(data.product_id), data.quantity]
    )
  } else if (data.movement_type === 'out') {
    await db.execute(
      'UPDATE stock_items SET quantity = quantity - ? WHERE id = ?',
      [data.quantity, stockId]
    )
  } else {
    // adjustment
    await db.execute(
      `INSERT INTO stock_items (id, warehouse_id, product_id, quantity)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET quantity = excluded.quantity`,
      [stockId, String(data.warehouse_id), String(data.product_id), data.quantity]
    )
  }

  // поставити в чергу
  const id = localId()
  await enqueue(db, 'movement', 'create', id, data)
  return { id, ...data, created_at: now(), _pending: true }
}

// ─── helpers ─────────────────────────────────────────────────

async function enqueue(db, entity, operation, localId, payload) {
  await db.execute(
    `INSERT INTO sync_queue (entity, operation, local_id, payload, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [entity, operation, localId, JSON.stringify(payload), now()]
  )
}
