import 'package:dio/dio.dart';
import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import '../../core/local_db.dart';
import '../../core/time_utils.dart';

class SyncWorker {
  final Dio dio;
  bool hasConflict = false;

  SyncWorker(this.dio);

  Future<int?> _serverOrderIdForLocal(Database db, String localId) async {
    final rows = await db.query(
      'local_orders',
      where: 'local_id = ?',
      whereArgs: [localId],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    final raw = rows.first['server_order_id'];
    if (raw == null) return null;
    return (raw as num).toInt();
  }

  Future<void> _patchPendingEventsOrderId(Database db, String localId, int orderId) async {
    final rows = await db.query(
      'pending_events',
      where: 'payload_json LIKE ?',
      whereArgs: ['%$localId%'],
    );
    for (final row in rows) {
      final id = row['id'] as int;
      final payload = jsonDecode(row['payload_json'] as String) as Map<String, dynamic>;
      if ((payload['order_id'] as num?)?.toInt() == orderId) continue;
      final payloadLocal =
          payload['local_order_id']?.toString() ?? payload['local_id']?.toString();
      if (payloadLocal == localId && (payload['order_id'] == null || payload['order_id'] == 0)) {
        payload['order_id'] = orderId;
        await db.update(
          'pending_events',
          {'payload_json': jsonEncode(payload), 'updated_at': nowIso()},
          where: 'id = ?',
          whereArgs: [id],
        );
      }
    }
  }

  Future<int?> _createServerOrderFromLocal(
    Database db,
    String localId,
    String token,
  ) async {
    final rows = await db.query(
      'local_orders',
      where: 'local_id = ?',
      whereArgs: [localId],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    final row = rows.first;
    final data = {
      'source': row['source']?.toString() ?? 'POS',
      'table_code': row['table_code']?.toString(),
      'notes': row['note']?.toString() ?? '',
    };
    final res = await dio.post(
      '/api/v1/orders/create',
      data: data,
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Idempotency-Key': 'sync_create_$localId',
        },
      ),
    );
    final payload = (res.data['data'] as Map<String, dynamic>? ?? <String, dynamic>{});
    final serverId = (payload['order_id'] as num?)?.toInt();
    if (serverId == null) return null;
    await db.update(
      'local_orders',
      {'server_order_id': serverId, 'updated_at': nowIso()},
      where: 'local_id = ?',
      whereArgs: [localId],
    );
    await _patchPendingEventsOrderId(db, localId, serverId);
    return serverId;
  }

  Future<Map<String, dynamic>> pushPull(
    String token, {
    int batchSize = 50,
  }) async {
    hasConflict = false;
    final db = await LocalDb.open();
    final nowIsoValue = DateTime.now().toIso8601String();
    final events = await db.query(
      'pending_events',
      where: 'next_retry_at IS NULL OR next_retry_at <= ?',
      whereArgs: [nowIsoValue],
      orderBy: 'id ASC',
      limit: batchSize,
    );

    var pushed = 0;
    var failed = 0;
    if (events.isNotEmpty) {
      final parsed = events
          .map(
            (e) => {
              'id': e['id'],
              'event_type': e['event_type'],
              'endpoint': e['endpoint'],
              'idempotency_key': e['idempotency_key'],
              'retries': e['retries'],
              'payload': jsonDecode((e['payload_json'] as String)),
            },
          )
          .toList();

      final createEvents = parsed
          .where((e) => e['event_type'] == 'create_order')
          .toList();
      final otherEvents = parsed
          .where((e) => e['event_type'] != 'create_order')
          .toList();

      if (createEvents.isNotEmpty) {
        final response = await dio.post(
          '/api/v1/sync/push',
          data: {
            'events': createEvents.map((e) {
              return {
                'type': e['event_type'],
                'endpoint': e['endpoint'],
                'idempotency_key': e['idempotency_key'],
                'payload': e['payload'],
              };
            }).toList(),
          },
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );
        final results = (response.data['data']?['results'] as List?) ?? [];
        for (var i = 0; i < createEvents.length; i++) {
          final row = createEvents[i];
          final id = (row['id'] as num).toInt();
          final result = i < results.length ? results[i] : null;
          final ok = result is Map && result['ok'] == true;
          if (ok) {
            pushed++;
            await db.delete('pending_events', where: 'id = ?', whereArgs: [id]);
            final payload = row['payload'] as Map<String, dynamic>;
            final localId = payload['local_id']?.toString() ?? payload['local_order_id']?.toString();
            final resMap = result['result'] as Map? ?? {};
            final serverId = (resMap['order_id'] as num?)?.toInt();
            if (localId != null && serverId != null) {
              await db.update(
                'local_orders',
                {'server_order_id': serverId, 'updated_at': nowIso()},
                where: 'local_id = ?',
                whereArgs: [localId],
              );
              await _patchPendingEventsOrderId(db, localId, serverId);
            }
          } else {
            failed++;
            final retries = ((row['retries'] as int?) ?? 0) + 1;
            final backoffSec = retries * retries * 5 > 300
                ? 300
                : retries * retries * 5;
            final nextRetryAt = DateTime.now()
                .add(Duration(seconds: backoffSec))
                .toIso8601String();
            final message = (result is Map ? result['message'] : 'sync_failed')
                .toString();
            await db.update(
              'pending_events',
              {
                'retries': retries,
                'next_retry_at': nextRetryAt,
                'last_error': message,
                'updated_at': nowIsoValue,
              },
              where: 'id = ?',
              whereArgs: [id],
            );
            if (message.contains('conflict') || message.contains('invalid')) {
              hasConflict = true;
            }
          }
        }
      }

      final readyEvents = <Map<String, dynamic>>[];
      for (final row in otherEvents) {
        final payload = row['payload'] as Map<String, dynamic>;
        final orderId = (payload['order_id'] as num?)?.toInt();
        if (orderId == null || orderId < 1) {
          final localId = payload['local_order_id']?.toString() ?? payload['local_id']?.toString();
          if (localId != null) {
            var serverId = await _serverOrderIdForLocal(db, localId);
            serverId ??= await _createServerOrderFromLocal(db, localId, token);
            if (serverId != null) {
              payload['order_id'] = serverId;
              await db.update(
                'pending_events',
                {'payload_json': jsonEncode(payload), 'updated_at': nowIso()},
                where: 'id = ?',
                whereArgs: [row['id']],
              );
              readyEvents.add(row);
            }
          }
        } else {
          readyEvents.add(row);
        }
      }

      if (readyEvents.isNotEmpty) {
        final response = await dio.post(
          '/api/v1/sync/push',
          data: {
            'events': readyEvents.map((e) {
              return {
                'type': e['event_type'],
                'endpoint': e['endpoint'],
                'idempotency_key': e['idempotency_key'],
                'payload': e['payload'],
              };
            }).toList(),
          },
          options: Options(headers: {'Authorization': 'Bearer $token'}),
        );
        final results = (response.data['data']?['results'] as List?) ?? [];
        for (var i = 0; i < readyEvents.length; i++) {
          final row = readyEvents[i];
          final id = (row['id'] as num).toInt();
          final result = i < results.length ? results[i] : null;
          final ok = result is Map && result['ok'] == true;
          if (ok) {
            pushed++;
            await db.delete('pending_events', where: 'id = ?', whereArgs: [id]);
          } else {
            failed++;
            final retries = ((row['retries'] as int?) ?? 0) + 1;
            final backoffSec = retries * retries * 5 > 300
                ? 300
                : retries * retries * 5;
            final nextRetryAt = DateTime.now()
                .add(Duration(seconds: backoffSec))
                .toIso8601String();
            final message = (result is Map ? result['message'] : 'sync_failed')
                .toString();
            await db.update(
              'pending_events',
              {
                'retries': retries,
                'next_retry_at': nextRetryAt,
                'last_error': message,
                'updated_at': nowIsoValue,
              },
              where: 'id = ?',
              whereArgs: [id],
            );
            if (message.contains('conflict') || message.contains('invalid')) {
              hasConflict = true;
            }
          }
        }
      }
    }

    final cursorRows = await db.query(
      'app_config',
      where: 'config_key = ?',
      whereArgs: ['sync_cursor'],
      limit: 1,
    );
    final cursor = cursorRows.isEmpty
        ? null
        : cursorRows.first['value_json']?.toString();
    final pullResponse = await dio.post(
      '/api/v1/sync/pull',
      data: {if (cursor != null && cursor.isNotEmpty) 'cursor': cursor},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final pullData =
        (pullResponse.data['data'] as Map<String, dynamic>? ??
        <String, dynamic>{});
    await _applyPullData(db, pullData);

    return {
      'pushed': pushed,
      'failed': failed,
      'has_conflict': hasConflict,
      'pull_cursor': pullData['cursor'],
    };
  }

  Future<void> _applyPullData(
    Database db,
    Map<String, dynamic> pullData,
  ) async {
    final products = (pullData['products'] as List?) ?? const [];
    final tables = (pullData['tables'] as List?) ?? const [];
    final cursor = pullData['cursor'];

    final batch = db.batch();
    for (final raw in products) {
      final p = raw as Map<String, dynamic>;
      final id = ((p['id_menu'] ?? p['id']) as num?)?.toInt();
      if (id == null) continue;
      final rawPrice = p['harga'] ?? p['price'] ?? 0;
      final rawStock = p['stok'] ?? p['stock'] ?? 0;
      batch.insert('product_cache', {
        'id_menu': id,
        'name': p['nama_menu']?.toString() ?? p['name']?.toString() ?? '-',
        'category': p['jenis_menu']?.toString() ?? p['category']?.toString(),
        'stock': rawStock is num ? rawStock.toInt() : int.tryParse(rawStock.toString()) ?? 0,
        'price': rawPrice is num ? rawPrice.toDouble() : double.tryParse(rawPrice.toString()) ?? 0,
        'tax_pct': (p['tax_pct'] as num?)?.toDouble() ?? 0,
        'service_pct': (p['service_pct'] as num?)?.toDouble() ?? 0,
        'is_active': (p['is_active'] == false || p['is_active'] == 0) ? 0 : 1,
        'updated_at': nowIso(),
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    for (final raw in tables) {
      final t = raw as Map<String, dynamic>;
      final code = t['table_code']?.toString();
      if (code == null || code.isEmpty) continue;
      batch.insert('table_cache', {
        'table_code': code,
        'table_name': t['table_name']?.toString() ?? code,
        'table_token': t['table_token']?.toString(),
        'is_active': (t['is_active'] == false || t['is_active'] == 0) ? 0 : 1,
        'updated_at': nowIso(),
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    if (cursor != null) {
      batch.insert('app_config', {
        'config_key': 'sync_cursor',
        'value_json': cursor.toString(),
        'updated_at': nowIso(),
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }
}
