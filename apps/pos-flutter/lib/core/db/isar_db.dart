import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';

class IsarDb {
  static Isar? _instance;

  static Future<Isar> open() async {
    if (_instance != null) return _instance!;
    final dir = await getApplicationDocumentsDirectory();
    // TODO: add Isar collections when migration starts.
    _instance = await Isar.open([], directory: dir.path);
    return _instance!;
  }
}
