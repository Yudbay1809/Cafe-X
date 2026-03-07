import '../../core/api_client.dart';
import '../../core/idempotency.dart';
import '../../core/local_db.dart';
import '../../core/time_utils.dart';
import '../audit/audit_service.dart';
import '../sync/event_queue.dart';

class ShiftService {
  ShiftService({
    required ApiClient apiClient,
    required EventQueue eventQueue,
    required AuditService auditService,
  }) : _apiClient = apiClient,
       _eventQueue = eventQueue,
       _auditService = auditService;

  final ApiClient _apiClient;
  final EventQueue _eventQueue;
  final AuditService _auditService;

  Future<int> openShift({
    required String token,
    required String actor,
    required String roleName,
    required double openingCash,
    bool offlineAllowed = true,
  }) async {
    final db = await LocalDb.open();
    final open = await db.query('shifts', where: "status = 'open'", limit: 1);
    if (open.isNotEmpty) {
      throw StateError(
        'Shift masih terbuka. Tutup dulu sebelum buka shift baru.',
      );
    }

    final now = nowIso();
    final localId = await db.insert('shifts', {
      'server_shift_id': null,
      'opened_by': actor,
      'opening_cash': openingCash,
      'expected_cash': openingCash,
      'status': 'open',
      'opened_at': now,
    });

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/shift/open',
      actor: actor,
      hint: localId.toString(),
    );
    try {
      final res = await _apiClient.post(
        '/api/v1/shift/open',
        token: token,
        idempotencyKey: idem,
        data: {'opening_cash': openingCash},
      );
      final sid = (res.data['data']?['shift']?['id'] as num?)?.toInt();
      if (sid != null) {
        await db.update(
          'shifts',
          {'server_shift_id': sid},
          where: 'id = ?',
          whereArgs: [localId],
        );
      }
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'open_shift',
        endpoint: '/api/v1/shift/open',
        actor: actor,
        idempotencyKey: idem,
        payload: {'opening_cash': openingCash, 'local_shift_id': localId},
      );
    }

    await _auditService.log(
      action: 'shift.open',
      actor: actor,
      roleName: roleName,
      payload: {'shift_id': localId, 'opening_cash': openingCash},
    );
    return localId;
  }

  Future<Map<String, dynamic>> closeShift({
    required String token,
    required String actor,
    required String roleName,
    required double closingCash,
    String notes = '',
    bool offlineAllowed = true,
  }) async {
    final db = await LocalDb.open();
    final open = await db.query('shifts', where: "status = 'open'", limit: 1);
    if (open.isEmpty) {
      throw StateError('Tidak ada shift terbuka.');
    }
    final shift = open.first;
    final shiftId = (shift['id'] as num).toInt();
    final openingCash = (shift['opening_cash'] as num).toDouble();
    final expectedCash = await _expectedCash(shiftId, openingCash);
    final variance = closingCash - expectedCash;
    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/shift/close',
      actor: actor,
      hint: shiftId.toString(),
    );

    await db.update(
      'shifts',
      {
        'expected_cash': expectedCash,
        'closing_cash': closingCash,
        'cash_variance': variance,
        'notes': notes,
        'status': 'closed',
        'closed_at': nowIso(),
      },
      where: 'id = ?',
      whereArgs: [shiftId],
    );

    try {
      await _apiClient.post(
        '/api/v1/shift/close',
        token: token,
        idempotencyKey: idem,
        data: {'closing_cash': closingCash, 'notes': notes},
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'close_shift',
        endpoint: '/api/v1/shift/close',
        actor: actor,
        idempotencyKey: idem,
        payload: {
          'closing_cash': closingCash,
          'notes': notes,
          'local_shift_id': shiftId,
        },
      );
    }

    await _auditService.log(
      action: 'shift.close',
      actor: actor,
      roleName: roleName,
      payload: {
        'shift_id': shiftId,
        'expected_cash': expectedCash,
        'closing_cash': closingCash,
        'variance': variance,
        'notes': notes,
      },
    );

    return {
      'shift_id': shiftId,
      'expected_cash': expectedCash,
      'closing_cash': closingCash,
      'cash_variance': variance,
      'notes': notes,
    };
  }

  Future<double> _expectedCash(int shiftId, double openingCash) async {
    final db = await LocalDb.open();
    final shiftRows = await db.query(
      'shifts',
      columns: ['opened_at'],
      where: 'id = ?',
      whereArgs: [shiftId],
      limit: 1,
    );
    if (shiftRows.isEmpty) return openingCash;
    final openedAt = shiftRows.first['opened_at'].toString();

    final row = await db.rawQuery(
      '''
      SELECT COALESCE(SUM(amount), 0) AS total_cash
      FROM local_payments
      WHERE method = 'cash' AND status = 'success' AND created_at >= ?
    ''',
      [openedAt],
    );

    final totalCash = (row.first['total_cash'] as num?)?.toDouble() ?? 0;
    return openingCash + totalCash;
  }
}
