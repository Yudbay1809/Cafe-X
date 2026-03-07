import '../../core/local_db.dart';

class ShiftReportService {
  Future<Map<String, dynamic>> currentShiftSummary() async {
    final db = await LocalDb.open();
    final shiftRows = await db.query('shifts', orderBy: 'id DESC', limit: 1);
    if (shiftRows.isEmpty) {
      return {'has_shift': false};
    }
    final shift = shiftRows.first;
    final openedAt = shift['opened_at'].toString();

    final trx = await db.rawQuery(
      '''
      SELECT COUNT(*) AS total_trx
      FROM local_orders
      WHERE status IN ('paid', 'canceled') AND created_at >= ?
    ''',
      [openedAt],
    );
    final voids = await db.rawQuery(
      '''
      SELECT COUNT(*) AS total_void
      FROM local_orders
      WHERE status = 'canceled' AND created_at >= ?
    ''',
      [openedAt],
    );
    final payments = await db.rawQuery(
      '''
      SELECT method, COALESCE(SUM(amount),0) AS total
      FROM local_payments
      WHERE status = 'success' AND created_at >= ?
      GROUP BY method
    ''',
      [openedAt],
    );

    return {
      'has_shift': true,
      'shift': shift,
      'total_transaksi': (trx.first['total_trx'] as int?) ?? 0,
      'total_void': (voids.first['total_void'] as int?) ?? 0,
      'payments': payments,
      'cash_variance': shift['cash_variance'],
    };
  }
}
