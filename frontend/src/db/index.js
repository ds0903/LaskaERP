import Database from '@tauri-apps/plugin-sql'

let _db = null

export async function getDb() {
  if (_db) return _db
  _db = await Database.load('sqlite:laskaerp.db')
  await initSchema()
  return _db
}

async function initSchema() {
  const db = _db
  await db.execute(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      address     TEXT,
      description TEXT,
      created_at  TEXT,
      server_id   INTEGER,
      _dirty      INTEGER DEFAULT 0
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      sku         TEXT NOT NULL,
      unit        TEXT NOT NULL DEFAULT 'шт',
      description TEXT,
      price       REAL DEFAULT 0,
      category    TEXT,
      created_at  TEXT,
      server_id   INTEGER,
      _dirty      INTEGER DEFAULT 0
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS stock_items (
      id           TEXT PRIMARY KEY,
      warehouse_id TEXT NOT NULL,
      product_id   TEXT NOT NULL,
      quantity     REAL DEFAULT 0
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      entity     TEXT NOT NULL,
      operation  TEXT NOT NULL,
      local_id   TEXT NOT NULL,
      payload    TEXT NOT NULL,
      created_at TEXT NOT NULL,
      attempts   INTEGER DEFAULT 0
    )
  `)
}

export function localId() {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
}
