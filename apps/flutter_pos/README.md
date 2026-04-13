Flutter POS API Client

This package provides a production-ready Dart API client to integrate with the Flutter POS backend as defined by docs/flutter-pos-openapi.yaml.

Usage example:
```dart
import 'package:flutter_pos_api_client/flutter_pos_api_client.dart';
import 'package:http/http.dart' as http;

void main() async {
  final client = FlutterPosApiClient(baseUrl: 'https://api.example', httpClient: http.Client(), token: 'TOKEN');
  final catalog = await client.fetchCatalog();
  print(catalog);
}
```
