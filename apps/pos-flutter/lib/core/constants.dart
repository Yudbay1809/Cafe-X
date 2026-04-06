enum OrderStatus {
  newer('new'),
  preparing('preparing'),
  ready('ready'),
  served('served'),
  paid('paid'),
  canceled('canceled');

  const OrderStatus(this.value);
  final String value;

  static OrderStatus fromValue(String value) {
    return OrderStatus.values.firstWhere((s) => s.value == value);
  }
}

enum PaymentMethod {
  cash('cash'),
  qris('qris'),
  transfer('transfer'),
  card('card'),
  other('other');

  const PaymentMethod(this.value);
  final String value;
}

const Set<String> supportedRoles = {'owner', 'admin', 'kasir'};

