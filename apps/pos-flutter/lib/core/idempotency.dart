import 'dart:math';

class IdempotencyKeyFactory {
  static final Random _random = Random();

  static String create({
    required String endpoint,
    required String actor,
    String? hint,
  }) {
    final ts = DateTime.now().millisecondsSinceEpoch;
    final rand = _random.nextInt(1 << 32).toRadixString(16).padLeft(8, '0');
    final suffix = (hint ?? '').trim();
    if (suffix.isEmpty) {
      return '$endpoint:$actor:$ts:$rand';
    }
    return '$endpoint:$actor:$ts:$rand:$suffix';
  }
}
