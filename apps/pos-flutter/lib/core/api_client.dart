import 'dart:math';

import 'package:dio/dio.dart';

import 'observability.dart';

class ApiClient {
  ApiClient({required String baseUrl, DeviceObservability? observability})
      : _observability = observability ?? DeviceObservability(),
        _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
          ),
        );

  final Dio _dio;
  final DeviceObservability _observability;
  final Random _random = Random();

  Future<Response<dynamic>> get(
    String path, {
    String? token,
    Map<String, dynamic>? queryParameters,
  }) async {
    return _wrap(path, (requestId) {
      return _dio.get(
        path,
        queryParameters: queryParameters,
        options: Options(headers: _headers(token, requestId: requestId)),
      );
    });
  }

  Future<Response<dynamic>> post(
    String path, {
    String? token,
    Map<String, dynamic>? data,
    String? idempotencyKey,
    ResponseType responseType = ResponseType.json,
    bool allowAnyStatus = false,
  }) async {
    return _wrap(path, (requestId) {
      return _dio.post(
        path,
        data: data ?? const <String, dynamic>{},
        options: Options(
          responseType: responseType,
          validateStatus: allowAnyStatus ? (_) => true : null,
          headers: _headers(
            token,
            requestId: requestId,
            idempotencyKey: idempotencyKey,
          ),
        ),
      );
    });
  }

  Future<Response<dynamic>> _wrap(
    String endpoint,
    Future<Response<dynamic>> Function(String requestId) call,
  ) async {
    final requestId = _requestId();
    final sw = Stopwatch()..start();
    try {
      final res = await call(requestId);
      sw.stop();
      await _observability.recordRequest(
        requestId: requestId,
        endpoint: endpoint,
        latencyMs: sw.elapsedMilliseconds,
        statusCode: res.statusCode ?? 200,
      );
      return res;
    } on DioException catch (e) {
      sw.stop();
      await _observability.recordRequest(
        requestId: requestId,
        endpoint: endpoint,
        latencyMs: sw.elapsedMilliseconds,
        statusCode: e.response?.statusCode ?? 0,
      );
      await _observability.recordError(
        requestId: requestId,
        endpoint: endpoint,
        statusCode: e.response?.statusCode ?? 0,
        message: e.message ?? e.toString(),
      );
      rethrow;
    }
  }

  Map<String, String> _headers(
    String? token, {
    required String requestId,
    String? idempotencyKey,
  }) {
    final map = <String, String>{
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
    };
    if (token != null && token.isNotEmpty) {
      map['Authorization'] = 'Bearer $token';
    }
    if (idempotencyKey != null && idempotencyKey.isNotEmpty) {
      map['Idempotency-Key'] = idempotencyKey;
    }
    return map;
  }

  String _requestId() {
    final ms = DateTime.now().millisecondsSinceEpoch;
    final rand = _random.nextInt(1 << 32).toRadixString(16).padLeft(8, '0');
    return 'req_$ms$rand';
  }
}
