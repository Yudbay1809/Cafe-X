import 'dart:convert';
import 'dart:io';

import '../../core/local_db.dart';
import '../../core/time_utils.dart';

class BackupService {
  static const _tables = [
    'device_sessions',
    'shifts',
    'local_orders',
    'local_order_items',
    'local_payments',
    'pending_events',
    'product_cache',
    'table_cache',
    'audit_logs',
    'app_config',
  ];

  Future<File> backupToFile(String directoryPath) async {
    final db = await LocalDb.open();
    final payload = <String, dynamic>{
      'created_at': nowIso(),
      'tables': <String, dynamic>{},
    };
    for (final table in _tables) {
      final rows = await db.query(table);
      (payload['tables'] as Map<String, dynamic>)[table] = rows;
    }

    final dir = Directory(directoryPath);
    if (!dir.existsSync()) {
      dir.createSync(recursive: true);
    }
    final file = File(
      '${dir.path}${Platform.pathSeparator}cafex-pos-backup-${DateTime.now().millisecondsSinceEpoch}.json',
    );
    await file.writeAsString(jsonEncode(payload));
    return file;
  }

  Future<void> restoreFromFile(String filePath) async {
    final file = File(filePath);
    if (!file.existsSync()) {
      throw StateError('File backup tidak ditemukan');
    }
    final decoded =
        jsonDecode(await file.readAsString()) as Map<String, dynamic>;
    final tables =
        (decoded['tables'] as Map<String, dynamic>? ?? <String, dynamic>{});
    final db = await LocalDb.open();
    await db.transaction((txn) async {
      for (final table in _tables) {
        await txn.delete(table);
      }
      for (final entry in tables.entries) {
        final tableName = entry.key;
        final rows = (entry.value as List?) ?? const [];
        for (final raw in rows) {
          await txn.insert(tableName, (raw as Map).cast<String, Object?>());
        }
      }
    });
  }
}
