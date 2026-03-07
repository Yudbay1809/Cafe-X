class LocalCartItem {
  final int productId;
  final int qty;
  final String productName;
  final double unitPrice;
  final String? note;

  LocalCartItem({
    required this.productId,
    required this.qty,
    required this.productName,
    required this.unitPrice,
    this.note,
  });

  double get subtotal => unitPrice * qty;
}
