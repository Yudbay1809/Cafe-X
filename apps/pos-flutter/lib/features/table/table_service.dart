import 'dart:math';
import 'package:sqflite/sqflite.dart';

import '../../core/api_client.dart';
import '../../core/idempotency.dart';
import '../../core/local_db.dart';
import '../../core/time_utils.dart';
import '../audit/audit_service.dart';
import '../sync/event_queue.dart';

class TableService {
  TableService({
    required ApiClient apiClient,
    required EventQueue eventQueue,
    required AuditService auditService,
  }) : _apiClient = apiClient,
       _eventQueue = eventQueue,
       _auditService = auditService;

  final ApiClient _apiClient;
  final EventQueue _eventQueue;
  final AuditService _auditService;
  final Random _random = Random();

  Future<void> upsertTable({
    required String token,
    required String actor,
    required String roleName,
    required String tableCode,
    required String tableName,
    required bool isActive,
    bool offlineAllowed = true,
  }) async {
    final db = await LocalDb.open();
    await db.insert('table_cache', {
      'table_code': tableCode,
      'table_name': tableName,
      'table_token': null,
      'is_active': isActive ? 1 : 0,
      'updated_at': nowIso(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/tables/upsert',
      actor: actor,
      hint: tableCode,
    );
    final payload = {
      'table_code': tableCode,
      'table_name': tableName,
      'is_active': isActive,
    };
    try {
      await _apiClient.post(
        '/api/v1/tables/upsert',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'table_upsert',
        endpoint: '/api/v1/tables/upsert',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'table.update',
      actor: actor,
      roleName: roleName,
      payload: payload,
    );
  }

  Future<String> rotateQrToken({
    required String token,
    required String actor,
    required String roleName,
    required String tableCode,
    bool offlineAllowed = true,
  }) async {
    final db = await LocalDb.open();
    final newToken = _newToken(tableCode);
    await db.update(
      'table_cache',
      {'table_token': newToken, 'updated_at': nowIso()},
      where: 'table_code = ?',
      whereArgs: [tableCode],
    );
    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/tables/rotate-token',
      actor: actor,
      hint: tableCode,
    );
    final payload = {'table_code': tableCode, 'table_token': newToken};
    try {
      await _apiClient.post(
        '/api/v1/tables/rotate-token',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'rotate_table_token',
        endpoint: '/api/v1/tables/rotate-token',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }
    await _auditService.log(
      action: 'table.rotate_qr',
      actor: actor,
      roleName: roleName,
      payload: payload,
    );
    return newToken;
  }

  String _newToken(String tableCode) {
    final ms = DateTime.now().millisecondsSinceEpoch;
    final rand = _random.nextInt(1 << 20).toRadixString(16);
    return 'tb_${tableCode}_$ms$rand';
  }
}
