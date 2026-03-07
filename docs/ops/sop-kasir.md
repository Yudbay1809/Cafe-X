# SOP Kasir

## 1. Buka Toko
1. Login kasir.
2. Jalankan shift open.
3. Jalankan smoke check cepat (opsional via supervisor).
4. Pastikan printer dan internet siap.

## 2. Transaksi Normal
1. Buat order.
2. Tambah item / edit qty bila perlu.
3. Proses pembayaran sesuai metode.
4. Cetak struk.

## 3. Jika Ada Salah Input
1. Gunakan cancel item jika hanya 1 item salah.
2. Gunakan cancel order jika seluruh order batal.
3. Untuk order bernilai besar, minta supervisor (permission `order.cancel.high`).

## 4. Gangguan Internet
1. Tetap input transaksi di aplikasi POS offline queue.
2. Pastikan event masuk antrian lokal.
3. Saat online kembali, jalankan sync worker.
4. Jika konflik, tandai dan eskalasi ke admin.

## 5. Tutup Toko
1. Jalankan shift close.
2. Verifikasi expected cash vs closing cash.
3. Jalankan backup harian.
4. Kirim laporan shift + issue harian.

## 6. Eskalasi Insiden
- P1 (tidak bisa bayar/transaksi): eskalasi <= 15 menit.
- P2 (sinkronisasi gagal massal): eskalasi <= 1 jam.
- P3 (minor bug): eskalasi <= 4 jam.
