# POS Kasir Implementation Checklist

## Implemented in Backend
- [x] Login kasir + role permission + token auth.
- [x] Shift open/close + expected cash + variance.
- [x] Order create/add-item/update-item/cancel-item/cancel-order.
- [x] Payment cash/qris/transfer/card/other + nominal validation.
- [x] Receipt print/reprint endpoint + audit trail.
- [x] Table move + order merge + order split.
- [x] Realtime stock sync on add/update/cancel item/order.
- [x] Double payment guard + idempotency.
- [x] Strict order state transition.
- [x] Sync worker endpoints (pull/push) with per-event result.
- [x] Local cache/sync queue foundation in Flutter POS.
- [x] User-friendly error responses for API.
- [x] Observability: request_id/latency/sync failure metric.
- [x] Shift report basic (orders/void/payments/variance).
- [x] Sensitive action guard (high-value cancel requires extra permission).
- [x] Automated tests for critical flows.
- [x] Smoke test script.

## Operational Work (manual by outlet team)
- [ ] Run UAT outlet real.
- [ ] Validate printer integration per device.
- [ ] Validate offline mode on real intermittent network.
- [ ] Device local backup execution policy.
- [ ] Support escalation drill.
