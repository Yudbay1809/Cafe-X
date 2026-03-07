# Fitur Belum Dimulai (Baseline 2026-03-08)

Dokumen ini jadi acuan untuk tracking fitur yang **belum dimulai**. Setiap kali fitur selesai, pindahkan atau tandai selesai dengan tanggal.

## A. Operasional & Rollout
- [ ] UAT fase 1 (1 outlet, 1 minggu parallel run).
- [ ] UAT fase 2 (3–5 outlet, peak load, offline recovery).
- [ ] Cutover bertahap tenant lama/new.
- [ ] Hypercare 14 hari (SLA, daily review).
- [ ] KPI produksi nyata (error rate, payment success, churn).

## B. Deployment Real
- [ ] Auto-deploy ke staging + rollback gate (butuh target hosting).
- [ ] Auto-deploy ke production + health check.
- [ ] Release policy tag ke environment nyata.

## C. Growth
- [ ] Multi-outlet analytics.
- [ ] Loyalty.
- [ ] Integrasi payment/accounting/marketplace.
