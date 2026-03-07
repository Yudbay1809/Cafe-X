String toCashierMessage(Object error) {
  final msg = error.toString().toLowerCase();
  if (msg.contains('socket') ||
      msg.contains('timeout') ||
      msg.contains('network')) {
    return 'Koneksi internet bermasalah. Transaksi disimpan dan akan disinkronkan.';
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
