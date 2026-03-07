import '../../core/api_client.dart';
import '../../core/local_db.dart';
import '../../core/time_utils.dart';
import 'package:sqflite/sqflite.dart';

class CacheService {
  CacheService(this._apiClient);

  final ApiClient _apiClient;

  Future<void> refreshMaster({required String token}) async {
    final db = await LocalDb.open();
    final productsRes = await _apiClient.get(
      '/api/v1/master/products',
      token: token,
    );
    final tablesRes = await _apiClient.get(
      '/api/v1/master/tables',
      token: token,
    );

    final productsPayload = productsRes.data['data'];
    final tablesPayload = tablesRes.data['data'];
    final products = productsPayload is Map
        ? (productsPayload['items'] as List? ?? const [])
        : (productsPayload as List? ?? const []);
    final tables = tablesPayload is Map
        ? (tablesPayload['items'] as List? ?? const [])
        : (tablesPayload as List? ?? const []);

    final batch = db.batch();
    for (final item in products) {
      final p = item as Map<String, dynamic>;
      final rawId = p['id_menu'] ?? p['id'];
      if (rawId == null) {
        continue;
      }
      final rawPrice = p['harga'] ?? p['price'] ?? 0;
      final rawStock = p['stok'] ?? p['stock'] ?? 0;
      batch.insert('product_cache', {
        'id_menu': (rawId as num).toInt(),
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

    for (final item in tables) {
      final t = item as Map<String, dynamic>;
      batch.insert('table_cache', {
        'table_code': t['table_code'].toString(),
        'table_name': t['table_name']?.toString() ?? t['table_code'].toString(),
        'table_token': t['table_token']?.toString(),
        'is_active': (t['is_active'] == false || t['is_active'] == 0) ? 0 : 1,
        'updated_at': nowIso(),
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, Object?>>> searchProducts(String query) async {
    final db = await LocalDb.open();
    final q = '%${query.trim()}%';
    return db.query(
      'product_cache',
      where: '(name LIKE ? OR category LIKE ?) AND is_active = 1',
      whereArgs: [q, q],
      orderBy: 'name ASC',
      limit: 150,
    );
  }

  Future<List<Map<String, Object?>>> allProducts() async {
    final db = await LocalDb.open();
    return db.query(
      'product_cache',
      where: 'is_active = 1',
      orderBy: 'name ASC',
      limit: 500,
    );
  }

  Future<List<Map<String, Object?>>> activeTables() async {
    final db = await LocalDb.open();
    return db.query(
      'table_cache',
      where: 'is_active = 1',
      orderBy: 'table_code ASC',
    );
  }

  Future<void> updateStock(int productId, int delta) async {
    final db = await LocalDb.open();
    final rows = await db.query(
      'product_cache',
      where: 'id_menu = ?',
      whereArgs: [productId],
      limit: 1,
    );
    if (rows.isEmpty) return;
    final row = rows.first;
    final current = (row['stock'] as num?)?.toInt() ?? 0;
    final next = current + delta;
    await db.update(
      'product_cache',
      {'stock': next < 0 ? 0 : next, 'updated_at': nowIso()},
      where: 'id_menu = ?',
      whereArgs: [productId],
    );
  }
}
