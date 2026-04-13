# Flutter POS API Client Skeleton (Dart)

This document provides a starting point for implementing a Flutter-based API client that communicates with Cafe-X API v1 (POS endpoints). It is a design artifact and should be translated into production Dart code by the FE team.

1) Core concepts
- Base URL: the API host (environment-dependent)
- Authentication: Bearer token via Authorization header
- HTTP client: using package: http or dio (prefer dio for interceptors and retry logic)
- Error handling: unify errors into ApiError with code, message, details
- Offline readiness: plan for an offline queue (to be implemented in the Flutter POS app)

2) Skeleton class (Dart-like pseudocode)
```dart
class ApiClient {
  final String baseUrl;
  String? token;
  final Dio _dio;

  ApiClient({required this.baseUrl, this.token}) : _dio = Dio(BaseOptions(baseUrl: baseUrl));

  void _authIntercept(RequestOptions options, RequestInterceptorHandler handler) {
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    return handler.next(options);
  }

  Future<void> setToken(String t) {
    token = t;
    _dio.options.headers['Authorization'] = 'Bearer $t';
  }

  // POS endpoints
  Future<Response> startShift({required String deviceId}) {
    return _dio.post('/pos/shifts/start', data: {
      'device_id': deviceId,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    });
  }

  Future<Response> endShift({required String deviceId}) {
    return _dio.post('/pos/shifts/end', data: {
      'device_id': deviceId,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    });
  }

  Future<Response> createOrder({required List<OrderItem> items, required String timestamp}) {
    final payload = {
      'items': items.map((i) => i.toJson()).toList(),
      'timestamp': timestamp,
    };
    return _dio.post('/pos/orders', data: payload);
  }

  Future<Response> addOrderItem({required int productId, required int quantity, required double price}) {
    return _dio.post('/pos/order-items', data: {
      'product_id': productId,
      'quantity': quantity,
      'price': price,
    });
  }

  Future<Response> makePayment({required String orderId, required double amount, required String method}) {
    return _dio.post('/pos/payments', data: {
      'order_id': orderId,
      'amount': amount,
      'method': method,
      'currency': 'IDR',
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    });
  }

  Future<Response> sync({String? lastSync}) {
    return _dio.post('/pos/sync', data: {'last_sync': lastSync ?? DateTime.now().toUtc().toIso8601String()});
  }

  Future<Response> fetchCatalog() {
    return _dio.get('/product');
  }

  Future<Response> fetchOutletConfig() {
    return _dio.get('/outlet/config');
  }
}

class OrderItem {
  final int productId;
  final int quantity;
  final double price;
  OrderItem({required this.productId, required this.quantity, required this.price});
  Map<String, dynamic> toJson() => {
        'product_id': productId,
        'quantity': quantity,
        'price': price,
      };
}
```

3) Notes for FE implementation
- Integrate with existing design tokens and error-handling conventions from other FE teams.
- Add interceptors for global error handling and token refresh if required by backend.
- Ensure the client respects offline-first strategy (to be implemented in the Flutter POS app) with a local queue.

4) Next steps
- Convert this skeleton into a real Dart package/module in the Flutter POS project.
- Generate concrete API client code using builder tools or manual coding.
- Keep the OpenAPI contract as the single source of truth for endpoints, data models, and payloads.
