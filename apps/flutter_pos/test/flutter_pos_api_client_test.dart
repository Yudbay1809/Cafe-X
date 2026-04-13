import 'dart:convert';

import '../lib/flutter_pos_api_client.dart';
import 'package:http/http.dart' as http;
import 'package:test/test.dart';

// Lightweight mock client using http.BaseClient
class MockClient extends http.BaseClient {
  final Future<http.Response> Function(http.Request) handler;
  MockClient(this.handler);
  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final http.Request req = request as http.Request;
    final resp = await handler(req);
    final stream = Stream.fromIterable([resp.bodyBytes]);
    return http.StreamedResponse(
      stream,
      resp.statusCode,
      headers: resp.headers,
      request: request,
    );
  }
}

void main() {
  const baseUrl = 'https://api.example';

  test('fetchCatalog returns catalog data on 200', () async {
    final mock = MockClient((req) async {
      expect(req.url.path, '/catalog');
      return http.Response(
        jsonEncode({
          'catalog': [
            {'id': '1', 'name': 'Coffee'},
          ],
        }),
        200,
      );
    });
    final client = FlutterPosApiClient(baseUrl: baseUrl, httpClient: mock);
    final data = await client.fetchCatalog();
    expect(data['catalog'][0]['name'], 'Coffee');
  });

  test('startShift handles 200 response', () async {
    final mock = MockClient((req) async {
      expect(req.url.path, '/shift/start');
      final payload = jsonDecode(req.body);
      expect(payload['locationId'], 'loc1');
      return http.Response(jsonEncode({'shiftId': 'sh1'}), 200);
    });
    final client = FlutterPosApiClient(baseUrl: baseUrl, httpClient: mock);
    final res = await client.startShift(locationId: 'loc1');
    expect(res['shiftId'], 'sh1');
  });

  test('error handling on non-2xx status', () async {
    final mock = MockClient((req) async {
      return http.Response('Unauthorized', 401);
    });
    final client = FlutterPosApiClient(baseUrl: baseUrl, httpClient: mock);
    expectLater(
      client.startShift(locationId: 'loc1'),
      throwsA(isA<ApiException>()),
    );
  });
}
