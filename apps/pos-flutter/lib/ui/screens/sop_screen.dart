import 'package:flutter/material.dart';

class SopScreen extends StatelessWidget {
  const SopScreen({super.key, required this.steps});

  final List<String> steps;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: Stepper(
              controlsBuilder: (context, _) => const SizedBox.shrink(),
              currentStep: 0,
              steps: steps
                  .asMap()
                  .entries
                  .map(
                    (e) => Step(
                      title: Text('SOP ${e.key + 1}'),
                      content: Text(e.value),
                      isActive: true,
                    ),
                  )
                  .toList(),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Shortcut', style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 8),
                    Text('F1: Order'),
                    Text('F2: Payment'),
                    Text('F3: Receipt'),
                    Text('F4: Kitchen'),
                    Text('F5: Reports'),
                    Text('F6: Settings'),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
