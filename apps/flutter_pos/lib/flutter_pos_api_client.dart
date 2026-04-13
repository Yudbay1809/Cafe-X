import 'dart:convert';
import 'package:http/http.dart' as http;

// Production-ready Flutter POS API client
// Implements the required endpoints from docs/flutter-pos-openapi.yaml

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);
  @override
  String toString() => 'ApiException($statusCode): $message';
}

class FlutterPosApiClient {
  final String baseUrl;
  String? _token;
  final http.Client _httpClient;
  int? _lastSync;

  FlutterPosApiClient({
    required this.baseUrl,
    http.Client? httpClient,
    String? token,
  }) : _httpClient = httpClient ?? http.Client(),
       _token = token;

  // Token management
  void setToken(String token) {
    _token = token;
  }

  // Last sync timestamp (epoch seconds)
  void updateLastSync(int epochSeconds) {
    _lastSync = epochSeconds;
  }

  Future<Map<String, dynamic>> startShift({
    required String locationId,
    String? userId,
  }) async {
    final url = Uri.parse('$baseUrl/shift/start');
    final body = {
      'locationId': locationId,
      if (userId != null) 'userId': userId,
      'startTime': DateTime.now().toUtc().toIso8601String(),
    };
    final resp = await _post(url, body);
    return resp;
  }

  Future<Map<String, dynamic>> endShift({required String locationId}) async {
    final url = Uri.parse('$baseUrl/shift/end');
    final body = {
      'locationId': locationId,
      'endTime': DateTime.now().toUtc().toIso8601String(),
    };
    final resp = await _post(url, body);
    return resp;
  }

  Future<Map<String, dynamic>> createOrder({
    String? customerId,
    List<Map<String, dynamic>>? items,
  }) async {
    final url = Uri.parse('$baseUrl/orders');
    final body = {
      if (customerId != null) 'customerId': customerId,
      if (items != null) 'items': items,
      'createdAt': DateTime.now().toUtc().toIso8601String(),
    };
    final resp = await _post(url, body);
    return resp;
  }

  Future<Map<String, dynamic>> addOrderItem(
    String orderId,
    Map<String, dynamic> item,
  ) async {
    final url = Uri.parse('$baseUrl/orders/$orderId/items');
    final resp = await _post(url, item);
    return resp;
  }

  Future<Map<String, dynamic>> makePayment(
    String orderId,
    Map<String, dynamic> payment,
  ) async {
    final url = Uri.parse('$baseUrl/payments');
    final body = {'orderId': orderId, 'payment': payment};
    final resp = await _post(url, body);
    return resp;
  }

  Future<Map<String, dynamic>> sync({int? lastSync}) async {
    final url = Uri.parse('$baseUrl/sync');
    final body = {
      if (lastSync != null) 'lastSync': lastSync,
      if (_lastSync != null) 'lastSync': _lastSync,
    };
    final resp = await _post(url, body);
    return resp;
  }

  Future<Map<String, dynamic>> fetchCatalog() async {
    final url = Uri.parse('$baseUrl/catalog');
    final resp = await _get(url);
    return resp;
  }

  Future<Map<String, dynamic>> fetchOutletConfig() async {
    final url = Uri.parse('$baseUrl/outlet-config');
    final resp = await _get(url);
    return resp;
  }

  // Internal helpers
  Future<Map<String, dynamic>> _get(Uri url) async {
    final req = http.Request('GET', url);
    _attachAuth(req);
    final streamed = await _httpClient.send(req);
    final res = await http.Response.fromStream(streamed);
    return _parseResponse(res);
  }

  Future<Map<String, dynamic>> _post(Uri url, Map<String, dynamic> body) async {
    final req = http.Request('POST', url)
      ..headers.addAll({'Content-Type': 'application/json'})
      ..body = jsonEncode(body);
    _attachAuth(req);
    final streamed = await _httpClient.send(req);
    final res = await http.Response.fromStream(streamed);
    return _parseResponse(res);
  }

  void _attachAuth(http.Request req) {
    if (_token != null) {
      req.headers["Authorization"] = 'Bearer $_token';
    }
  }

  Map<String, dynamic> _parseResponse(http.Response resp) {
    final status = resp.statusCode;
    if (status >= 200 && status < 300) {
      if (resp.body.isEmpty) return {};
      try {
        return jsonDecode(resp.body) as Map<String, dynamic>;
      } catch (_) {
        return {'raw': resp.body};
      }
    } else {
      throw ApiException(status, resp.body);
    }
  }
}
