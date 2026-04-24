import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('cafe_pos.db').then(db => {
      dbInstance = db;
      return db;
    });
  }
  
  return dbPromise;
}

export async function initDatabase() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category_id INTEGER,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_orders (
      id TEXT PRIMARY KEY, 
      total REAL NOT NULL,
      subtotal REAL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      status TEXT NOT NULL,
      payment_method TEXT,
      member_id TEXT,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS offline_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS petty_cash (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT,
      amount REAL,
      created_at TEXT,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS online_orders_cache (
      id TEXT PRIMARY KEY,
      table_number TEXT,
      total REAL,
      items_json TEXT,
      created_at TEXT,
      status TEXT DEFAULT 'pending'
    );
  `);
}
