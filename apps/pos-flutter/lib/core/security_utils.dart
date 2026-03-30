import 'dart:convert';
import 'package:crypto/crypto.dart';

String hashPin(String pin) {
  final bytes = utf8.encode(pin.trim());
  return sha256.convert(bytes).toString();
}
