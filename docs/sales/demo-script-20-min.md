# Cafe-X Demo Script (20 Menit)

## Tujuan
Menunjukkan alur end-to-end: customer order, POS checkout, admin operasional, billing, dan demo reset.

## Persiapan (5 menit sebelum demo)
- Pastikan backend aktif: `C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=9000`.
- Pastikan `customer-next` jalan di `:3001`, `admin-next` di `:3002`, POS Flutter siap login.
- Gunakan tenant demo dengan 40 menu, 20 meja, dan data baseline.

## Agenda 20 Menit
1. Menit 1-4: Customer Experience
- Buka `customer-next`.
- Tunjukkan menu langsung tampil tanpa wajib scan token.
- Input nomor meja manual (contoh: `A7`) atau prefill via QR.
- Tambah produk ke cart, place order, buka halaman status (stepper + ETA).

2. Menit 5-10: POS Experience
- Login kasir dan buka shift.
- Tunjukkan order masuk, add/edit/cancel item.
- Jalankan quick pay (cash / QRIS), cetak receipt, reprint.
- Tunjukkan banner sync state (online/pending/fail/conflict).

3. Menit 11-15: Admin Ops
- Buka dashboard KPI.
- Buka onboarding wizard outlet pertama.
- Tunjukkan manajemen meja + QR print batch A4/A5/A6.
- Tunjukkan laporan dan audit log.

4. Menit 16-18: Billing SaaS
- Buka halaman Subscription.
- Upgrade/downgrade plan.
- Buat invoice manual, mark paid.
- Tunjukkan audit billing tercatat.

5. Menit 19-20: Demo Reset
- Jalankan `POST /api/v1/billing/demo/reset` dari Admin.
- Verifikasi data transaksi kembali baseline.
- Ringkas SLA support + paket harga.

## Pesan Penutup
- Go-live cepat: 1 outlet bisa mulai dalam 1-2 hari.
- Model biaya transparan: subscription bulanan.
- Sistem siap scale ke multi outlet bertahap.
