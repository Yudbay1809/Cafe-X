import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import '../../core/local_db.dart';
import '../../core/time_utils.dart';

class EventQueue {
  Future<void> enqueue({
    required String eventType,
    required String endpoint,
    required String actor,
    required String idempotencyKey,
    required Map<String, dynamic> payload,
  }) async {
    final db = await LocalDb.open();
    await db.insert('pending_events', {
      'event_type': eventType,
      'endpoint': endpoint,
      'actor': actor,
      'idempotency_key': idempotencyKey,
      'payload_json': jsonEncode(payload),
      'retries': 0,
      'next_retry_at': null,
      'last_error': null,
      'created_at': nowIso(),
      'updated_at': nowIso(),
    }, conflictAlgorithm: ConflictAlgorithm.ignore);
  }
}
