import 'dart:async';

class ShortcutBus {
  final _controller = StreamController<String>.broadcast();

  Stream<String> get stream => _controller.stream;

  void emit(String action) => _controller.add(action);

  void dispose() => _controller.close();
}
