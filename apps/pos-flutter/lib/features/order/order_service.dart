import 'dart:convert';

import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../core/idempotency.dart';
import '../../core/local_db.dart';
import '../../core/time_utils.dart';
import '../audit/audit_service.dart';
import '../cache/cache_service.dart';
import '../sync/event_queue.dart';
import 'order_models.dart';
import 'order_state_machine.dart';

class OrderService {
  OrderService({
    required ApiClient apiClient,
    required EventQueue eventQueue,
    required CacheService cacheService,
    required AuditService auditService,
    OrderStateMachine? stateMachine,
  }) : _apiClient = apiClient,
       _eventQueue = eventQueue,
       _cacheService = cacheService,
       _auditService = auditService,
       _stateMachine = stateMachine ?? OrderStateMachine();

  final ApiClient _apiClient;
  final EventQueue _eventQueue;
  final CacheService _cacheService;
  final AuditService _auditService;
  final OrderStateMachine _stateMachine;

  Future<void> _requireOpenShift() async {
    final db = await LocalDb.open();
    final rows = await db.query('shifts', where: "status = 'open'", limit: 1);
    if (rows.isEmpty) {
      throw StateError('Shift belum dibuka');
    }
  }

  Future<String> createOrder({
    required String token,
    required String actor,
    required String roleName,
    required String source,
    String? tableCode,
    String? note,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    final db = await LocalDb.open();
    final localId = _newLocalOrderId();
    final now = nowIso();

    await db.insert('local_orders', {
      'local_id': localId,
      'server_order_id': null,
      'source': source,
      'table_code': tableCode,
      'note': note,
      'status': OrderStatus.newer.value,
      'subtotal': 0,
      'tax_amount': 0,
      'service_amount': 0,
      'total_amount': 0,
      'created_at': now,
      'updated_at': now,
    });

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/create',
      actor: actor,
      hint: localId,
    );
    try {
      final res = await _apiClient.post(
        '/api/v1/orders/create',
        token: token,
        idempotencyKey: idem,
        data: {'source': source, 'table_code': tableCode, 'note': note},
      );
      final data = (res.data['data'] as Map<String, dynamic>? ?? <String, dynamic>{});
      final order = (data['order'] as Map<String, dynamic>? ?? <String, dynamic>{});
      final serverId = (data['order_id'] as num?)?.toInt() ?? (order['id'] as num?)?.toInt();
      if (serverId != null) {
        await db.update(
          'local_orders',
          {'server_order_id': serverId},
          where: 'local_id = ?',
          whereArgs: [localId],
        );
      }
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'create_order',
        endpoint: '/api/v1/orders/create',
        actor: actor,
        idempotencyKey: idem,
        payload: {
          'local_id': localId,
          'source': source,
          'table_code': tableCode,
          'note': note,
        },
      );
    }

    await _auditService.log(
      action: 'order.create',
      actor: actor,
      roleName: roleName,
      payload: {
        'order_local_id': localId,
        'source': source,
        'table_code': tableCode,
      },
    );
    return localId;
  }

  Future<void> addItem({
    required String token,
    required String actor,
    required String roleName,
    required String orderLocalId,
    required int productId,
    required int qty,
    String? note,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    if (qty <= 0) throw ArgumentError('Qty harus > 0');
    final db = await LocalDb.open();

    await db.transaction((txn) async {
      final productRows = await txn.query(
        'product_cache',
        where: 'id_menu = ?',
        whereArgs: [productId],
        limit: 1,
      );
      if (productRows.isEmpty) {
        throw StateError('Produk tidak ditemukan di cache lokal');
      }
      final p = productRows.first;
      final stock = (p['stock'] as num?)?.toInt() ?? 0;
      if (stock < qty) {
        throw StateError('Stok tidak cukup');
      }
      final price = (p['price'] as num?)?.toDouble() ?? 0;
      final name = p['name'].toString();
      await txn.insert('local_order_items', {
        'order_local_id': orderLocalId,
        'product_id': productId,
        'product_name': name,
        'qty': qty,
        'unit_price': price,
        'line_subtotal': price * qty,
        'note': note,
        'status': 'active',
        'created_at': nowIso(),
        'updated_at': nowIso(),
      });
    });

    await _cacheService.updateStock(productId, -qty);
    await _recomputeOrderTotals(orderLocalId);

    final order = await _orderByLocalId(orderLocalId);
    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/add-item',
      actor: actor,
      hint: '$orderLocalId:$productId:$qty',
    );
    final payload = {
      'order_id': order?['server_order_id'],
      'local_order_id': orderLocalId,
      'product_id': productId,
      'qty': qty,
      'note': note,
    };

    try {
      await _apiClient.post(
        '/api/v1/orders/add-item',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'add_item',
        endpoint: '/api/v1/orders/add-item',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'order.add_item',
      actor: actor,
      roleName: roleName,
      payload: {
        'order_local_id': orderLocalId,
        'product_id': productId,
        'qty': qty,
      },
    );
  }

  Future<void> updateItemQty({
    required String token,
    required String actor,
    required String roleName,
    required int itemId,
    required int newQty,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    if (newQty <= 0) {
      throw ArgumentError('Qty baru harus > 0');
    }
    final db = await LocalDb.open();
    final rows = await db.query(
      'local_order_items',
      where: 'id = ?',
      whereArgs: [itemId],
      limit: 1,
    );
    if (rows.isEmpty) {
      throw StateError('Item order tidak ditemukan');
    }
    final item = rows.first;
    final oldQty = (item['qty'] as num).toInt();
    final diff = newQty - oldQty;
    final productId = (item['product_id'] as num).toInt();
    if (diff > 0) {
      final product = await db.query(
        'product_cache',
        where: 'id_menu = ?',
        whereArgs: [productId],
        limit: 1,
      );
      final stock = (product.first['stock'] as num?)?.toInt() ?? 0;
      if (stock < diff) {
        throw StateError('Stok tidak cukup untuk tambah qty');
      }
      await _cacheService.updateStock(productId, -diff);
    } else if (diff < 0) {
      await _cacheService.updateStock(productId, -diff);
    }

    final price = (item['unit_price'] as num).toDouble();
    final orderLocalId = item['order_local_id'].toString();
    await db.update(
      'local_order_items',
      {'qty': newQty, 'line_subtotal': price * newQty, 'updated_at': nowIso()},
      where: 'id = ?',
      whereArgs: [itemId],
    );
    await _recomputeOrderTotals(orderLocalId);

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/update-item',
      actor: actor,
      hint: itemId.toString(),
    );
    final payload = {'item_id': itemId, 'qty': newQty};
    try {
      await _apiClient.post(
        '/api/v1/orders/update-item',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'update_item',
        endpoint: '/api/v1/orders/update-item',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'order.update_item',
      actor: actor,
      roleName: roleName,
      payload: {'item_id': itemId, 'new_qty': newQty},
    );
  }

  Future<void> cancelItem({
    required String token,
    required String actor,
    required String roleName,
    required int itemId,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    final db = await LocalDb.open();
    final rows = await db.query(
      'local_order_items',
      where: 'id = ?',
      whereArgs: [itemId],
      limit: 1,
    );
    if (rows.isEmpty) throw StateError('Item tidak ditemukan');
    final item = rows.first;
    if (item['status'] == 'canceled') return;

    final qty = (item['qty'] as num).toInt();
    final productId = (item['product_id'] as num).toInt();
    final orderLocalId = item['order_local_id'].toString();

    await db.update(
      'local_order_items',
      {'status': 'canceled', 'updated_at': nowIso()},
      where: 'id = ?',
      whereArgs: [itemId],
    );
    await _cacheService.updateStock(productId, qty);
    await _recomputeOrderTotals(orderLocalId);

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/cancel-item',
      actor: actor,
      hint: itemId.toString(),
    );
    final payload = {'item_id': itemId};
    try {
      await _apiClient.post(
        '/api/v1/orders/cancel-item',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'cancel_item',
        endpoint: '/api/v1/orders/cancel-item',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'order.cancel_item',
      actor: actor,
      roleName: roleName,
      payload: {'item_id': itemId},
    );
  }

  Future<void> cancelOrder({
    required String token,
    required String actor,
    required String roleName,
    required String orderLocalId,
    required String reason,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    final db = await LocalDb.open();
    final order = await _orderByLocalId(orderLocalId);
    if (order == null) throw StateError('Order tidak ditemukan');

    final current = OrderStatus.fromValue(order['status'].toString());
    _stateMachine.assertTransition(current, OrderStatus.canceled);

    final items = await db.query(
      'local_order_items',
      where: "order_local_id = ? AND status = 'active'",
      whereArgs: [orderLocalId],
    );
    for (final i in items) {
      await _cacheService.updateStock(
        (i['product_id'] as num).toInt(),
        (i['qty'] as num).toInt(),
      );
    }
    await db.update(
      'local_order_items',
      {'status': 'canceled', 'updated_at': nowIso()},
      where: 'order_local_id = ?',
      whereArgs: [orderLocalId],
    );
    await db.update(
      'local_orders',
      {'status': OrderStatus.canceled.value, 'updated_at': nowIso()},
      where: 'local_id = ?',
      whereArgs: [orderLocalId],
    );
    await _recomputeOrderTotals(orderLocalId);

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/cancel',
      actor: actor,
      hint: orderLocalId,
    );
    final payload = {'order_id': order['server_order_id'], 'reason': reason};
    try {
      await _apiClient.post(
        '/api/v1/orders/cancel',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'cancel_order',
        endpoint: '/api/v1/orders/cancel',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'order.cancel',
      actor: actor,
      roleName: roleName,
      payload: {'order_local_id': orderLocalId, 'reason': reason},
    );
  }

  Future<void> updateStatus({
    required String token,
    required String actor,
    required String roleName,
    required String orderLocalId,
    required OrderStatus nextStatus,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    final db = await LocalDb.open();
    final order = await _orderByLocalId(orderLocalId);
    if (order == null) throw StateError('Order tidak ditemukan');
    final current = OrderStatus.fromValue(order['status'].toString());
    _stateMachine.assertTransition(current, nextStatus);
    await db.update(
      'local_orders',
      {'status': nextStatus.value, 'updated_at': nowIso()},
      where: 'local_id = ?',
      whereArgs: [orderLocalId],
    );

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/status',
      actor: actor,
      hint: orderLocalId,
    );
    final payload = {
      'order_id': order['server_order_id'],
      'status': nextStatus.value,
    };
    try {
      await _apiClient.post(
        '/api/v1/orders/status',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'status_order',
        endpoint: '/api/v1/orders/status',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'order.status',
      actor: actor,
      roleName: roleName,
      payload: {
        'order_local_id': orderLocalId,
        'from': current.value,
        'to': nextStatus.value,
      },
    );
  }

  Future<void> moveTable({
    required String token,
    required String actor,
    required String roleName,
    required String orderLocalId,
    required String toTableCode,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    final db = await LocalDb.open();
    await db.update(
      'local_orders',
      {'table_code': toTableCode, 'updated_at': nowIso()},
      where: 'local_id = ?',
      whereArgs: [orderLocalId],
    );
    final order = await _orderByLocalId(orderLocalId);

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/move-table',
      actor: actor,
      hint: orderLocalId,
    );
    final payload = {
      'order_id': order?['server_order_id'],
      'to_table_code': toTableCode,
    };
    try {
      await _apiClient.post(
        '/api/v1/orders/move-table',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'move_table',
        endpoint: '/api/v1/orders/move-table',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'table.move',
      actor: actor,
      roleName: roleName,
      payload: {'order_local_id': orderLocalId, 'to_table_code': toTableCode},
    );
  }

  Future<void> mergeOrders({
    required String token,
    required String actor,
    required String roleName,
    required String targetOrderLocalId,
    required String sourceOrderLocalId,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    final db = await LocalDb.open();
    await db.update(
      'local_order_items',
      {'order_local_id': targetOrderLocalId, 'updated_at': nowIso()},
      where: "order_local_id = ? AND status = 'active'",
      whereArgs: [sourceOrderLocalId],
    );
    await db.update(
      'local_orders',
      {
        'status': OrderStatus.canceled.value,
        'updated_at': nowIso(),
        'note': 'merged_to:$targetOrderLocalId',
      },
      where: 'local_id = ?',
      whereArgs: [sourceOrderLocalId],
    );
    await _recomputeOrderTotals(targetOrderLocalId);
    await _recomputeOrderTotals(sourceOrderLocalId);

    final target = await _orderByLocalId(targetOrderLocalId);
    final source = await _orderByLocalId(sourceOrderLocalId);
    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/merge',
      actor: actor,
      hint: '$sourceOrderLocalId:$targetOrderLocalId',
    );
    final payload = {
      'target_order_id': target?['server_order_id'],
      'source_order_id': source?['server_order_id'],
    };
    try {
      await _apiClient.post(
        '/api/v1/orders/merge',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'merge_order',
        endpoint: '/api/v1/orders/merge',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'order.merge',
      actor: actor,
      roleName: roleName,
      payload: {
        'source_order_local_id': sourceOrderLocalId,
        'target_order_local_id': targetOrderLocalId,
      },
    );
  }

  Future<String> splitOrder({
    required String token,
    required String actor,
    required String roleName,
    required String sourceOrderLocalId,
    required List<int> itemIds,
    bool offlineAllowed = true,
  }) async {
    await _requireOpenShift();
    final db = await LocalDb.open();
    final sourceOrder = await _orderByLocalId(sourceOrderLocalId);
    if (sourceOrder == null) throw StateError('Order sumber tidak ditemukan');

    final newOrderLocalId = _newLocalOrderId();
    final now = nowIso();
    await db.insert('local_orders', {
      'local_id': newOrderLocalId,
      'server_order_id': null,
      'source': sourceOrder['source'],
      'table_code': sourceOrder['table_code'],
      'note': 'split_from:$sourceOrderLocalId',
      'status': OrderStatus.newer.value,
      'subtotal': 0,
      'tax_amount': 0,
      'service_amount': 0,
      'total_amount': 0,
      'created_at': now,
      'updated_at': now,
    });
    for (final itemId in itemIds) {
      await db.update(
        'local_order_items',
        {'order_local_id': newOrderLocalId, 'updated_at': nowIso()},
        where: 'id = ? AND order_local_id = ? AND status = ?',
        whereArgs: [itemId, sourceOrderLocalId, 'active'],
      );
    }
    await _recomputeOrderTotals(sourceOrderLocalId);
    await _recomputeOrderTotals(newOrderLocalId);

    final idem = IdempotencyKeyFactory.create(
      endpoint: '/api/v1/orders/split',
      actor: actor,
      hint: sourceOrderLocalId,
    );
    final payload = {
      'source_order_id': sourceOrder['server_order_id'],
      'item_ids': itemIds,
    };
    try {
      await _apiClient.post(
        '/api/v1/orders/split',
        token: token,
        idempotencyKey: idem,
        data: payload,
      );
    } catch (_) {
      if (!offlineAllowed) rethrow;
      await _eventQueue.enqueue(
        eventType: 'split_order',
        endpoint: '/api/v1/orders/split',
        actor: actor,
        idempotencyKey: idem,
        payload: payload,
      );
    }

    await _auditService.log(
      action: 'order.split',
      actor: actor,
      roleName: roleName,
      payload: {
        'source_order_local_id': sourceOrderLocalId,
        'new_order_local_id': newOrderLocalId,
        'item_ids': itemIds,
      },
    );
    return newOrderLocalId;
  }

  Future<PosOrder?> detail(String localId) async {
    final db = await LocalDb.open();
    final row = await db.query(
      'local_orders',
      where: 'local_id = ?',
      whereArgs: [localId],
      limit: 1,
    );
    if (row.isEmpty) return null;
    final o = row.first;
    return PosOrder(
      localId: o['local_id'].toString(),
      serverOrderId: (o['server_order_id'] as num?)?.toInt(),
      source: o['source'].toString(),
      tableCode: o['table_code']?.toString(),
      note: o['note']?.toString(),
      status: OrderStatus.fromValue(o['status'].toString()),
      subtotal: (o['subtotal'] as num).toDouble(),
      taxAmount: (o['tax_amount'] as num).toDouble(),
      serviceAmount: (o['service_amount'] as num).toDouble(),
      totalAmount: (o['total_amount'] as num).toDouble(),
    );
  }

  Future<List<PosOrderItem>> items(String localId) async {
    final db = await LocalDb.open();
    final rows = await db.query(
      'local_order_items',
      where: 'order_local_id = ?',
      whereArgs: [localId],
      orderBy: 'id ASC',
    );
    return rows
        .map(
          (r) => PosOrderItem(
            id: (r['id'] as num?)?.toInt(),
            orderLocalId: r['order_local_id'].toString(),
            productId: (r['product_id'] as num).toInt(),
            productName: r['product_name'].toString(),
            qty: (r['qty'] as num).toInt(),
            unitPrice: (r['unit_price'] as num).toDouble(),
            lineSubtotal: (r['line_subtotal'] as num).toDouble(),
            note: r['note']?.toString(),
            status: r['status'].toString(),
          ),
        )
        .toList();
  }

  Future<void> _recomputeOrderTotals(String orderLocalId) async {
    final db = await LocalDb.open();
    final sumRows = await db.rawQuery(
      '''
      SELECT COALESCE(SUM(line_subtotal), 0) AS subtotal
      FROM local_order_items
      WHERE order_local_id = ? AND status = 'active'
    ''',
      [orderLocalId],
    );
    final cfgRows = await db.query(
      'app_config',
      where: "config_key IN ('tax_pct','service_pct')",
    );

    double taxPct = 0;
    double servicePct = 0;
    for (final row in cfgRows) {
      final key = row['config_key'].toString();
      final value = jsonDecode(row['value_json'].toString());
      if (key == 'tax_pct') {
        taxPct = (value as num?)?.toDouble() ?? 0;
      } else if (key == 'service_pct') {
        servicePct = (value as num?)?.toDouble() ?? 0;
      }
    }

    final subtotal = (sumRows.first['subtotal'] as num).toDouble();
    final taxAmount = subtotal * (taxPct / 100);
    final serviceAmount = subtotal * (servicePct / 100);
    final total = subtotal + taxAmount + serviceAmount;

    await db.update(
      'local_orders',
      {
        'subtotal': subtotal,
        'tax_amount': taxAmount,
        'service_amount': serviceAmount,
        'total_amount': total,
        'updated_at': nowIso(),
      },
      where: 'local_id = ?',
      whereArgs: [orderLocalId],
    );
  }

  Future<Map<String, Object?>?> _orderByLocalId(String localId) async {
    final db = await LocalDb.open();
    final rows = await db.query(
      'local_orders',
      where: 'local_id = ?',
      whereArgs: [localId],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return rows.first;
  }

  String _newLocalOrderId() {
    return 'L_';
  }
}