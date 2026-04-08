# Roadmap Lengkap Dari Posisi Sekarang

## Phase 0 - Baseline & Hardening
- [ ] 1. Kunci baseline backend Laravel di `d:\Cafe-X-laravel` (jangan tambah fitur baru sebelum stabil).
- [ ] 2. Pastikan `.env` production-like sudah benar (`APP_ENV`, `APP_KEY`, `DB_*`, `CACHE_STORE`, `QUEUE_CONNECTION`).
- [x] 3. Pastikan API jalan di port paralel tetap (`9000`) untuk fase transisi.
- [x] 4. Dokumentasikan endpoint final `/api/v1` sebagai satu-satunya kontrak resmi.
- [x] 5. Lock enum bisnis.
- [x] 6. `order status`: `new/preparing/ready/served/paid/canceled`.
- [x] 7. `payment method`: `cash/qris/transfer/card/other`.
- [ ] 8. Audit ulang schema agar semua FK/index query panas sudah ada.
- [ ] 9. Audit ulang unique/composite index untuk tabel `orders`, `payments`, `stock_movements`, `sync_logs`, `idempotency`.
- [ ] 10. Jalankan migrasi dari DB kosong untuk verifikasi greenfield.
- [ ] 11. Jalankan migrasi di DB existing untuk verifikasi kompatibilitas legacy.
- [ ] 12. Jalankan seeder baseline ulang dan cek idempotent.
- [ ] 13. Verifikasi role default: `owner/admin/kasir/kitchen`.
- [ ] 14. Verifikasi permission map granular dipakai middleware endpoint.

## Phase 1 - Security, Auth, Permission
- [x] 15. Verifikasi token auth.
- [x] 16. bearer parsing valid.
- [x] 17. token expiry valid.
- [x] 18. revoke/logout valid.
- [x] 19. context `auth_user`, `tenant_id`, `outlet_id` selalu attach.
- [x] 20. Verifikasi permission middleware.
- [x] 21. `order.create`
- [x] 22. `order.pay`
- [x] 23. `order.cancel`
- [x] 24. `shift.close`
- [x] 25. `table.manage`
- [x] 26. `report.view`
- [ ] 27. Verifikasi `AuthController`.
- [ ] 28. login success/fail.
- [ ] 29. hash migration password legacy.
- [ ] 30. rate limit login.
- [ ] 31. lockout sementara.

## Phase 2 - Core POS Modules
- [x] 32. Verifikasi `MasterController`.
- [x] 33. list products tenant scope.
- [x] 34. list tables tenant/outlet scope.
- [x] 35. upsert table.
- [x] 36. rotate QR token dan invalidate token lama.
- [x] 37. Verifikasi `ShiftController`.
- [x] 38. open shift.
- [x] 39. close shift.
- [x] 40. expected cash.
- [x] 41. cash variance.
- [x] 42. notes.
- [x] 43. Verifikasi `OrderController`.
- [x] 44. create order.
- [x] 45. add item dengan row lock stok.
- [x] 46. detail order.
- [x] 47. pay order.
- [x] 48. cancel + restore stok.
- [x] 49. strict state transition.
- [x] 50. Verifikasi `QrController`.
- [x] 51. create order dari `table_token`.
- [x] 52. validasi meja aktif/nonaktif.
- [x] 53. throttle per token/device.
- [x] 54. Verifikasi `SyncController`.
- [x] 55. pull by cursor.
- [x] 56. push batch.
- [x] 57. per-event success/fail.
- [x] 58. retry-safe via idempotency key.
- [x] 59. Pastikan seluruh logic transaksi berada di service layer, bukan controller.
- [x] 60. Pastikan idempotency engine menyimpan replay response stabil.
- [x] 61. Pastikan audit trail aktif untuk aksi kritikal.

## Phase 3 - Observability, Validation, API Contract
- [x] 62. Pastikan structured logging memuat `request_id`, `tenant_id`, `outlet_id`, latency, status.
- [x] 63. Pastikan error trace di-log aman tanpa bocor data sensitif.
- [x] 64. Pastikan observability minimum aktif.
- [x] 65. `/api/v1/health`.
- [x] 66. queue lag metric.
- [x] 67. sync failure metric.
- [x] 68. threshold alert baseline.
- [x] 69. Finalisasi semua FormRequest per endpoint.
- [x] 70. Samakan format error response API untuk semua kasus validasi/bisnis/server.
- [x] 71. Finalisasi OpenAPI v1 lengkap request/response + contoh sukses/gagal.
- [x] 72. Sinkronkan dokumentasi auth/role/permission dengan implementasi aktual.
- [x] 73. Generate Postman collection + environment dev/staging.
- [x] 74. Tambah script smoke runtime dan jadikan bagian SOP release.

## Phase 4 - Testing & Regression
- [x] 75. Lengkapi test otomatis.
- [x] 76. unit test service rules.
- [x] 77. feature test endpoint.
- [x] 78. test double payment.
- [x] 79. test cancel restore stok.
- [x] 80. test sync mixed-result.
- [x] 81. test concurrency stok paralel (multi request).
- [x] 82. Port 27 regression scenario lama ke test Laravel.

## Phase 5 - Ops & Deployment
- [x] 83. Setup backup harian otomatis (mysqldump + retention policy).
- [x] 84. Jalankan restore drill berkala dan catat RTO/RPO.
- [ ] 85. Siapkan pipeline deploy.
- [ ] 86. lint.
- [ ] 87. test.
- [ ] 88. build artifact.
- [ ] 89. migrate.
- [ ] 90. health check.
- [ ] 91. rollback gate.
- [ ] 92. Integrasikan client existing ke backend Laravel untuk UAT tanpa ubah UI besar.

## Phase 6 - UAT & Cutover
- [ ] 93. Jalankan UAT fase 1.
- [ ] 94. 1 outlet.
- [ ] 95. 1 minggu parallel run.
- [ ] 96. fixing bug prioritas tinggi harian.
- [ ] 97. Evaluasi KPI fase 1.
- [ ] 98. error rate.
- [ ] 99. payment success rate.
- [ ] 100. sync failure rate.
- [ ] 101. median latency.
- [ ] 102. stabilitas shift close.
- [ ] 103. Jalankan UAT fase 2.
- [ ] 104. 3–5 outlet.
- [ ] 105. validasi peak hour load.
- [ ] 106. validasi offline recovery.
- [ ] 107. Siapkan cutover plan bertahap.
- [ ] 108. tenant baru langsung Laravel stack.
- [ ] 109. tenant lama migrasi per batch.
- [ ] 110. freeze window untuk migrasi data.
- [ ] 111. rollback plan per batch.

## Phase 7 - Stabilization, Go-Live, Hypercare
- [ ] 112. Stabilization pasca cutover.
- [ ] 113. tuning index/query lambat.
- [ ] 114. tuning worker queue/sync.
- [ ] 115. hardening retry/backoff policy.
- [x] 116. release packaging.
- [x] 117. enforce tier Basic/Pro/Premium.
- [x] 118. feature flag per paket.
- [ ] 119. go-live checklist final.
- [ ] 120. backup valid.
- [ ] 121. alert aktif.
- [ ] 122. runbook support siap.
- [ ] 123. rollback tested.
- [ ] 124. hypercare 14 hari.
- [ ] 125. SLA insiden.
- [ ] 126. daily review bug/latency/churn.
- [ ] 127. post-mortem untuk major incident.

## Phase 8 - Growth
- [ ] 128. setelah stabil, lanjut growth roadmap.
- [ ] 129. multi-outlet analytics.
- [ ] 130. loyalty.
- [ ] 131. integrasi payment/accounting/marketplace.

## Phase 9 - UI/UX Max Remodel
- [ ] Referensi plan: docs/planning/ui-ux-max-plan.md
- [ ] Jalankan Phase 0-5 sesuai plan UI/UX Max
