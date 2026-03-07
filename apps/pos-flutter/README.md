# Cafe-X POS Flutter (Logic First)

Fokus implementasi saat ini adalah logic backend-client untuk kasir, bukan UI final.

## Scope yang sudah dicakup

1. Login kasir + sesi device + role/permission guard.
2. Shift open/close + expected cash + variance.
3. Order flow create/add/edit/cancel item + cancel order.
4. Payment flow (cash/qris/transfer/card/other) + split payment.
5. Guard double payment + idempotency key.
6. Status transition strict (`new -> preparing -> ready -> served -> paid/canceled`).
7. Pindah meja + merge/split order.
8. Sinkron stok lokal saat add/cancel item.
9. Offline queue event + sync worker push/pull + retry backoff + conflict flag.
10. Local cache produk/harga/pajak/service/meja.
11. Receipt print/reprint service + audit log.
12. Observability dasar: request metric + failed sync counter.
13. Laporan shift ringkas.
14. Proteksi aksi sensitif via role/PIN override policy.
15. Backup/restore data lokal.
16. Smoke test service + SOP in-app content.

## Catatan runtime

- Gunakan backend Laravel di `http://127.0.0.1:9000`.
- Flutter SDK belum tersedia pada environment ini saat verifikasi otomatis dilakukan.
- Logic layer ditulis agar tetap bisa diuji unit-level dengan Dart/Flutter test ketika SDK siap.
