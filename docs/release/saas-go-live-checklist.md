# SaaS Go-Live Checklist (Cafe-X)

## Commercial
- [ ] Pricing page publish (Basic/Pro/Premium)
- [ ] Trial policy final
- [ ] Invoice template final
- [ ] Support channel aktif
- [ ] SLA basic dipublikasikan

## Product
- [ ] Customer app: menu -> cart -> order-status lulus smoke
- [ ] Admin app: onboarding + subscription + invoice lulus smoke
- [ ] POS app: offline/sync/conflict lulus smoke
- [ ] Demo reset tenant berjalan

## Backend
- [ ] Billing tables ter-migrate (`plans/subscriptions/invoices/invoice_items/billing_audit_logs`)
- [ ] Endpoint billing `/api/v1` lulus test
- [ ] Feature gate plan aktif
- [ ] Audit log billing aktif dengan `request_id`

## Ops
- [ ] Backup harian aktif
- [ ] Restore drill terakhir tercatat
- [ ] Alert baseline aktif
- [ ] Incident template siap dipakai

## Sales Readiness
- [ ] Demo script 20 menit dipraktikkan minimal 1x tanpa blocker
- [ ] Dataset demo siap
- [ ] One-pager dan FAQ objection siap
