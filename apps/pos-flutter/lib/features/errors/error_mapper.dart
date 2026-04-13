import 'package:flutter/foundation.dart';

String toCashierMessage(Object error) {
  final msg = error.toString().toLowerCase();
  final rawMsg = error.toString();
  debugPrint('toCashierMessage raw: $rawMsg');

  // Business logic errors first - show actual message
  if (rawMsg.startsWith('Bad state: ')) {
    return rawMsg.substring(10); // Remove "Bad state: " prefix
  }
  if (msg.contains('akun terkunci') || msg.contains('locked')) {
    return 'Akun terkunci sementara. Tunggu beberapa menit lalu coba lagi.';
  }
  if (msg.contains('username atau password salah') ||
      msg.contains('invalid credentials')) {
    return 'Username atau password salah. Coba lagi.';
  }
  if (msg.contains('too many requests') ||
      msg.contains('throttle') ||
      msg.contains('429')) {
    return 'Terlalu banyak percobaan login. Coba lagi sebentar lagi.';
  }
  if (msg.contains('sqlite') ||
      msg.contains('database') ||
      msg.contains('no such column') ||
      msg.contains('table') ||
      msg.contains('constraint')) {
    return 'Data lokal POS perlu disegarkan. Tutup aplikasi lalu buka lagi.';
  }
  if (msg.contains('socket') ||
      msg.contains('timeout') ||
      msg.contains('network') ||
      msg.contains('unable to connect')) {
    return 'Koneksi ke server bermasalah. Cek Base URL dan jaringan.';
  }
  if (msg.contains('bad state') ||
      msg.contains('format respons login') ||
      msg.contains('nosuchmethoderror')) {
    return 'Respons server tidak terbaca dengan benar. Silakan coba lagi.';
  }
  if (msg.contains('forbidden') ||
      msg.contains('403') ||
      msg.contains('permission')) {
    return 'Aksi tidak diizinkan untuk role Anda. Hubungi supervisor.';
  }
  if (msg.contains('401') ||
      msg.contains('unauthorized') ||
      msg.contains('token')) {
    return 'Sesi login berakhir. Silakan login ulang.';
  }
  if (msg.contains('stock') || msg.contains('stok')) {
    return 'Stok tidak mencukupi untuk item ini.';
  }
  if (msg.contains('double payment') || msg.contains('already paid')) {
    return 'Pesanan ini sudah dibayar. Cek riwayat transaksi.';
  }

  return 'Terjadi kendala. Coba lagi atau hubungi admin outlet.';
}
