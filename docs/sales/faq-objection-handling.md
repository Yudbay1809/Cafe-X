# Cafe-X FAQ & Objection Handling

## 1. "Bisa jalan tanpa internet?"
Bisa. POS tetap menerima order lokal dan queue sync akan push saat koneksi kembali.

## 2. "Kalau internet putus saat bayar?"
Pembayaran disimpan aman dengan idempotency dan audit trail. Saat online, sinkronisasi dilanjutkan.

## 3. "Kami baru 1 outlet, apakah overkill?"
Tidak. Basic plan memang didesain untuk 1 outlet, lalu bisa upgrade saat bertambah cabang.

## 4. "Bagaimana onboarding kasir?"
Tersedia onboarding wizard + SOP in-app untuk buka shift, transaksi, gangguan internet, dan tutup shift.

## 5. "Apakah data aman?"
Role/permission granular, audit log untuk aksi kritikal, dan backup/restore runbook.

## 6. "Kalau mau berhenti langganan?"
Status subscription bisa diubah, invoice tersimpan, dan data tetap bisa diekspor sesuai kebijakan.

## 7. "Berapa cepat bisa go-live?"
Rata-rata 1-2 hari untuk 1 outlet dengan setup printer, meja QR, dan training kasir.
