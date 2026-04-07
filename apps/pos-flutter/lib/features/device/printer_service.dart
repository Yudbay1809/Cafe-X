import 'package:esc_pos_printer/esc_pos_printer.dart';
import 'package:esc_pos_utils/esc_pos_utils.dart';

class PrinterService {
  Future<void> printText({
    required String ip,
    required int port,
    required String text,
    String paperWidth = '80',
  }) async {
    final profile = await CapabilityProfile.load();
    final size = paperWidth == '58' ? PaperSize.mm58 : PaperSize.mm80;
    final printer = NetworkPrinter(size, profile);
    final res = await printer.connect(ip, port: port);
    if (res != PosPrintResult.success) {
      throw StateError('Printer connect failed: ${res.msg}');
    }
    for (final line in text.split('\n')) {
      printer.text(line);
    }
    printer.feed(2);
    printer.cut();
    printer.disconnect();
  }
}