import '../../core/local_db.dart';
import '../audit/audit_service.dart';
import 'dart:io';

abstract class ReceiptPrinter {
  Future<void> printText(String text);
}

class ReceiptService {
  ReceiptService(this._auditService);

  final AuditService _auditService;

  Future<void> enqueueFailedPrint({
    required String orderLocalId,
    required String receiptText,
    required String action,
    String? error,
  }) async {
    final db = await LocalDb.open();
    final now = DateTime.now().toIso8601String();
    await db.insert('receipt_queue', {
      'order_local_id': orderLocalId,
      'receipt_text': receiptText,
      'action': action,
      'status': 'pending',
      'attempts': 0,
      'last_error': error,
      'created_at': now,
      'updated_at': now,
    });
  }

  Future<int> pendingQueueCount() async {
    final db = await LocalDb.open();
    final rows = await db.rawQuery("SELECT COUNT(*) as c FROM receipt_queue WHERE status = 'pending'");
    return (rows.first['c'] as int?) ?? 0;
  }

  Future<int> processQueue({required ReceiptPrinter printer, int limit = 10}) async {
    final db = await LocalDb.open();
    final rows = await db.query(
      'receipt_queue',
      where: "status = 'pending'",
      orderBy: 'id ASC',
      limit: limit,
    );
    var success = 0;
    for (final row in rows) {
      final id = row['id'] as int;
      final text = row['receipt_text'] as String;
      final attempts = (row['attempts'] as int?) ?? 0;
      final now = DateTime.now().toIso8601String();
      try {
        await printer.printText(text);
        await db.update(
          'receipt_queue',
          {
            'status': 'done',
            'attempts': attempts + 1,
            'updated_at': now,
          },
          where: 'id = ?',
          whereArgs: [id],
        );
        success += 1;
      } catch (e) {
        final nextStatus = attempts + 1 >= 3 ? 'failed' : 'pending';
        await db.update(
          'receipt_queue',
          {
            'status': nextStatus,
            'attempts': attempts + 1,
            'last_error': e.toString(),
            'updated_at': now,
          },
          where: 'id = ?',
          whereArgs: [id],
        );
      }
    }
    return success;
  }

  Future<String> buildReceiptText(String orderLocalId) async {
    final db = await LocalDb.open();
    final orderRows = await db.query(
      'local_orders',
      where: 'local_id = ?',
      whereArgs: [orderLocalId],
      limit: 1,
    );
    if (orderRows.isEmpty) throw StateError('Order tidak ditemukan');
    final order = orderRows.first;
    final items = await db.query(
      'local_order_items',
      where: "order_local_id = ? AND status = 'active'",
      whereArgs: [orderLocalId],
      orderBy: 'id ASC',
    );
    final pay = await db.query(
      'local_payments',
      where: 'order_local_id = ?',
      whereArgs: [orderLocalId],
      orderBy: 'id ASC',
    );

    final sb = StringBuffer();
    sb.writeln('CAFE-X');
    sb.writeln('Order: ${order['local_id']}');
    sb.writeln('Status: ${order['status']}');
    sb.writeln('Meja: ${order['table_code'] ?? '-'}');
    sb.writeln('------------------------------');
    for (final i in items) {
      sb.writeln('${i['product_name']} x${i['qty']} = ${i['line_subtotal']}');
    }
    sb.writeln('------------------------------');
    sb.writeln('Subtotal: ${order['subtotal']}');
    sb.writeln('Pajak: ${order['tax_amount']}');
    sb.writeln('Service: ${order['service_amount']}');
    sb.writeln('Total: ${order['total_amount']}');
    if (pay.isNotEmpty) {
      sb.writeln('Pembayaran:');
      for (final p in pay) {
        sb.writeln('- ${p['method']}: ${p['amount']}');
      }
    }
    sb.writeln('Terima kasih');
    return sb.toString();
  }

  Future<void> print({
    required String orderLocalId,
    required ReceiptPrinter printer,
    required String actor,
    required String roleName,
    String? saveDir,
    String? receiptText,
  }) async {
    if (saveDir != null && saveDir.isNotEmpty) {
      await saveToFile(orderLocalId, saveDir);
    }
    final text = receiptText ?? await buildReceiptText(orderLocalId);
    try {
      await printer.printText(text);
    } catch (e) {
      await enqueueFailedPrint(
        orderLocalId: orderLocalId,
        receiptText: text,
        action: 'receipt.print',
        error: e.toString(),
      );
      rethrow;
    }
    await _auditService.log(
      action: 'receipt.print',
      actor: actor,
      roleName: roleName,
      payload: {'order_local_id': orderLocalId},
    );
  }

  Future<void> reprint({
    required String orderLocalId,
    required ReceiptPrinter printer,
    required String actor,
    required String roleName,
    String? saveDir,
    String? receiptText,
  }) async {
    if (saveDir != null && saveDir.isNotEmpty) {
      await saveToFile(orderLocalId, saveDir);
    }
    final text = receiptText ?? await buildReceiptText(orderLocalId);
    try {
      await printer.printText(text);
    } catch (e) {
      await enqueueFailedPrint(
        orderLocalId: orderLocalId,
        receiptText: text,
        action: 'receipt.reprint',
        error: e.toString(),
      );
      rethrow;
    }
    await _auditService.log(
      action: 'receipt.reprint',
      actor: actor,
      roleName: roleName,
      payload: {'order_local_id': orderLocalId},
    );
  }

  Future<String> saveToFile(String orderLocalId, String directoryPath) async {
    final text = await buildReceiptText(orderLocalId);
    final dir = Directory(directoryPath);
    if (!dir.existsSync()) {
      dir.createSync(recursive: true);
    }
    final file = File('${dir.path}${Platform.pathSeparator}receipt-$orderLocalId.txt');
    await file.writeAsString(text);
    await _auditService.log(
      action: 'receipt.save',
      actor: 'system',
      roleName: 'system',
      payload: {'order_local_id': orderLocalId, 'path': file.path},
    );
    return file.path;
  }
}



