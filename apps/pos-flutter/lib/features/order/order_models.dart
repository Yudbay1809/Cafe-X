import '../../core/constants.dart';

class PosOrder {
  PosOrder({
    required this.localId,
    this.serverOrderId,
    required this.source,
    this.tableCode,
    this.note,
    required this.status,
    required this.subtotal,
    required this.taxAmount,
    required this.serviceAmount,
    required this.totalAmount,
  });

  final String localId;
  final int? serverOrderId;
  final String source;
  final String? tableCode;
  final String? note;
  final OrderStatus status;
  final double subtotal;
  final double taxAmount;
  final double serviceAmount;
  final double totalAmount;
}

class PosOrderItem {
  PosOrderItem({
    this.id,
    required this.orderLocalId,
    required this.productId,
    required this.productName,
    required this.qty,
    required this.unitPrice,
    required this.lineSubtotal,
    this.note,
    this.status = 'active',
  });

  final int? id;
  final String orderLocalId;
  final int productId;
  final String productName;
  final int qty;
  final double unitPrice;
  final double lineSubtotal;
  final String? note;
  final String status;
}
