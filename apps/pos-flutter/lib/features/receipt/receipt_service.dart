import '../../core/local_db.dart';
import '../audit/audit_service.dart';
import 'dart:io';

abstract class ReceiptPrinter {
  Future<void> printText(String text);
}

class ReceiptService {
  ReceiptService(this._auditService);

  final AuditService _auditService;

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
  }) async {
    if (saveDir != null && saveDir.isNotEmpty) {
      await saveToFile(orderLocalId, saveDir);
    }
    final text = await buildReceiptText(orderLocalId);
    await printer.printText(text);
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
  }) async {
    if (saveDir != null && saveDir.isNotEmpty) {
      await saveToFile(orderLocalId, saveDir);
    }
    final text = await buildReceiptText(orderLocalId);
    await printer.printText(text);
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
