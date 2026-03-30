import 'dart:io';

import 'package:path/path.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

class LocalDb {
  static const _dbName = 'cafex_pos.db';
  static const _dbVersion = 3;

  static Future<Database> open() async {
    if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    }
    final path = join(await getDatabasesPath(), _dbName);
    return openDatabase(
      path,
      version: _dbVersion,
      onCreate: (db, version) async {
        await _createSchema(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await _createV2Tables(db);
        }
        if (oldVersion < 3) {
          await _createV3Tables(db);
        }
      },
    );
  }

  static Future<void> _createSchema(Database db) async {
    await db.execute('''
      CREATE TABLE device_sessions (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        username TEXT NOT NULL,
        role_name TEXT NOT NULL,
        permissions_json TEXT NOT NULL,
        tenant_id INTEGER NOT NULL,
        outlet_id INTEGER NOT NULL,
        access_token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        pin_hash TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_shift_id INTEGER NULL,
        opened_by TEXT NOT NULL,
        opening_cash REAL NOT NULL,
        expected_cash REAL NOT NULL DEFAULT 0,
        closing_cash REAL NULL,
        cash_variance REAL NULL,
        notes TEXT NULL,
        status TEXT NOT NULL,
        opened_at TEXT NOT NULL,
        closed_at TEXT NULL
      )
    ''');
    await db.execute("CREATE INDEX idx_shifts_status ON shifts(status)");

    await db.execute('''
      CREATE TABLE local_orders (
        local_id TEXT PRIMARY KEY,
        server_order_id INTEGER NULL,
        source TEXT NOT NULL,
        table_code TEXT NULL,
        note TEXT NULL,
        status TEXT NOT NULL,
        subtotal REAL NOT NULL DEFAULT 0,
        tax_amount REAL NOT NULL DEFAULT 0,
        service_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX idx_local_orders_status ON local_orders(status)",
    );
    await db.execute(
      "CREATE INDEX idx_local_orders_server_id ON local_orders(server_order_id)",
    );

    await db.execute('''
      CREATE TABLE local_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_local_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        qty INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        line_subtotal REAL NOT NULL,
        note TEXT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX idx_order_items_order_local_id ON local_order_items(order_local_id)",
    );

    await db.execute('''
      CREATE TABLE local_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_local_id TEXT NOT NULL,
        method TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        reference_no TEXT NULL,
        created_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE UNIQUE INDEX uq_local_payments_idem ON local_payments(idempotency_key)",
    );
    await db.execute(
      "CREATE INDEX idx_local_payments_order_local_id ON local_payments(order_local_id)",
    );

    await db.execute('''
      CREATE TABLE pending_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        actor TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        retries INTEGER NOT NULL DEFAULT 0,
        next_retry_at TEXT NULL,
        last_error TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE UNIQUE INDEX uq_pending_events_idem ON pending_events(idempotency_key)",
    );
    await db.execute(
      "CREATE INDEX idx_pending_events_retry ON pending_events(next_retry_at, retries)",
    );

    await db.execute('''
      CREATE TABLE product_cache (
        id_menu INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NULL,
        stock INTEGER NOT NULL,
        price REAL NOT NULL,
        tax_pct REAL NOT NULL DEFAULT 0,
        service_pct REAL NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE table_cache (
        table_code TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        table_token TEXT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        role_name TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX idx_audit_logs_action ON audit_logs(action)",
    );

    await db.execute('''
      CREATE TABLE device_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        latency_ms INTEGER NOT NULL,
        status_code INTEGER NOT NULL,
        failed_sync_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE receipt_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_local_id TEXT NOT NULL,
        receipt_text TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX idx_receipt_queue_status ON receipt_queue(status, attempts)"
    );

    await db.execute('''
      CREATE TABLE app_config (
        config_key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
  }

  static Future<void> _createV2Tables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS device_sessions (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        username TEXT NOT NULL,
        role_name TEXT NOT NULL,
        permissions_json TEXT NOT NULL,
        tenant_id INTEGER NOT NULL,
        outlet_id INTEGER NOT NULL,
        access_token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        pin_hash TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_shift_id INTEGER NULL,
        opened_by TEXT NOT NULL,
        opening_cash REAL NOT NULL,
        expected_cash REAL NOT NULL DEFAULT 0,
        closing_cash REAL NULL,
        cash_variance REAL NULL,
        notes TEXT NULL,
        status TEXT NOT NULL,
        opened_at TEXT NOT NULL,
        closed_at TEXT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status)",
    );
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_pending_events_retry ON pending_events(next_retry_at, retries)",
    );
    await db.execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS uq_pending_events_idem ON pending_events(idempotency_key)",
    );
    await db.execute('''
      CREATE TABLE IF NOT EXISTS local_orders (
        local_id TEXT PRIMARY KEY,
        server_order_id INTEGER NULL,
        source TEXT NOT NULL,
        table_code TEXT NULL,
        note TEXT NULL,
        status TEXT NOT NULL,
        subtotal REAL NOT NULL DEFAULT 0,
        tax_amount REAL NOT NULL DEFAULT 0,
        service_amount REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_local_orders_status ON local_orders(status)",
    );
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_local_orders_server_id ON local_orders(server_order_id)",
    );
    await db.execute('''
      CREATE TABLE IF NOT EXISTS local_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_local_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        qty INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        line_subtotal REAL NOT NULL,
        note TEXT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_order_items_order_local_id ON local_order_items(order_local_id)",
    );
    await db.execute('''
      CREATE TABLE IF NOT EXISTS local_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_local_id TEXT NOT NULL,
        method TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        reference_no TEXT NULL,
        created_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS uq_local_payments_idem ON local_payments(idempotency_key)",
    );
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_local_payments_order_local_id ON local_payments(order_local_id)",
    );
    await db.execute('''
      CREATE TABLE IF NOT EXISTS table_cache (
        table_code TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        table_token TEXT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        role_name TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)",
    );
    await db.execute('''
      CREATE TABLE IF NOT EXISTS device_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        latency_ms INTEGER NOT NULL,
        status_code INTEGER NOT NULL,
        failed_sync_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE IF NOT EXISTS app_config (
        config_key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
  }

  static Future<void> _createV3Tables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS receipt_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_local_id TEXT NOT NULL,
        receipt_text TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_receipt_queue_status ON receipt_queue(status, attempts)"
    );
  }
}




