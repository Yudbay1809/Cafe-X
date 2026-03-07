import 'package:sqflite/sqflite.dart';

import 'local_db.dart';
import 'time_utils.dart';

class DeviceObservability {
  Future<void> recordRequest({
    required String requestId,
    required String endpoint,
    required int latencyMs,
    required int statusCode,
  }) async {
    final db = await LocalDb.open();
    final failedSyncCount = await _failedSyncCount(db);
    await db.insert('device_metrics', {
      'request_id': requestId,
      'endpoint': endpoint,
      'latency_ms': latencyMs,
      'status_code': statusCode,
      'failed_sync_count': failedSyncCount,
      'created_at': nowIso(),
    });
  }

  Future<int> _failedSyncCount(Database db) async {
    final row = await db.rawQuery(
      "SELECT COUNT(*) AS total FROM pending_events WHERE retries > 0",
    );
    return ((row.first['total'] as int?) ?? 0);
  }

  Future<Map<String, dynamic>> summary() async {
    final db = await LocalDb.open();
    final latest = await db.rawQuery('''
      SELECT endpoint, latency_ms, status_code, created_at
      FROM device_metrics
      ORDER BY id DESC
      LIMIT 30
    ''');
    final failures = await db.rawQuery(
      "SELECT COUNT(*) AS total FROM pending_events WHERE retries > 0",
    );
    return {
      'failed_sync_count': ((failures.first['total'] as int?) ?? 0),
      'latest_requests': latest,
    };
  }
}
