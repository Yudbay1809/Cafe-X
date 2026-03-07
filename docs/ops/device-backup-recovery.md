# Device Local Backup & Recovery (POS)

## Local backup policy
- Backup local DB SQLite per shift close.
- Simpan minimal 7 file terakhir di storage device.

## Recovery procedure
1. Install ulang aplikasi POS.
2. Restore file SQLite terbaru.
3. Login ulang dan jalankan sync pull.
4. Kirim pending events bila ada.
5. Verifikasi laporan shift terakhir.

## Validation
- Lakukan recovery drill minimal 1x per bulan.
