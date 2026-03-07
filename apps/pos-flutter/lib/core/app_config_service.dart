import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import 'local_db.dart';
import 'time_utils.dart';

class AppConfigService {
  Future<String> getString(String key, {String fallback = ''}) async {
    final db = await LocalDb.open();
    final rows = await db.query('app_config', where: 'config_key = ?', whereArgs: [key], limit: 1);
    if (rows.isEmpty) return fallback;
    final value = rows.first['value_json']?.toString();
    if (value == null || value.isEmpty) return fallback;
    return jsonDecode(value).toString();
  }

  Future<void> setString(String key, String value) async {
    final db = await LocalDb.open();
    await db.insert(
      'app_config',
      {
        'config_key': key,
        'value_json': jsonEncode(value),
        'updated_at': nowIso(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<int> getPendingEventCount() async {
    final db = await LocalDb.open();
    final row = await db.rawQuery('SELECT COUNT(*) AS total FROM pending_events');
    return (row.first['total'] as int?) ?? 0;
  }
}
