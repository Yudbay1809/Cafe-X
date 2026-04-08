# Go-Live Checklist

## Build & Quality
- [ ] Backend test hijau
- [ ] Admin build hijau
- [ ] Customer build hijau
- [ ] POS analyze/build hijau

## Deployment
- [ ] Pipeline `deploy-pipeline` staging sukses
- [ ] Health check staging sukses
- [ ] Rollback gate staging diuji
- [ ] Pipeline `deploy-pipeline` production sukses
- [ ] Health check production sukses
- [ ] Rollback gate production diuji

## Data & Billing
- [ ] Billing migration (`plans/subscriptions/invoices/invoice_items/billing_audit_logs`) sudah terpasang
- [ ] Seeder demo siap untuk sales demo
- [ ] Invoice manual flow (create/update/mark-paid) tervalidasi

## Ops Readiness
- [ ] Backup valid
- [ ] Alert active
- [ ] On-call support assigned
- [ ] Runbook distributed
- [ ] KPI baseline captured

## Sign-off
- [ ] UAT sign-off approved
- [ ] Sales/demo script berhasil tanpa blocker
