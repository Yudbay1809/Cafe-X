import 'package:flutter/material.dart';

import '../features/errors/error_mapper.dart';

void showError(BuildContext context, Object error) {
  final message = toCashierMessage(error);
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message)),
  );
}

Future<String?> promptText(
  BuildContext context, {
  required String title,
  String hint = '',
  String initial = '',
  bool isNumber = false,
}) async {
  final controller = TextEditingController(text: initial);
  final result = await showDialog<String>(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : TextInputType.text,
          decoration: InputDecoration(hintText: hint),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Batal')),
          TextButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('OK')),
        ],
      );
    },
  );
  return result;
}
