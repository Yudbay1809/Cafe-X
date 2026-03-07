# Sprint Board (4 Weeks)

## Goal
Deliver production-ready backend core and integration-ready contracts for:
1. POS transaction flow.
2. QR table ordering.
3. Offline sync baseline.

## Week 1: Platform & Core API Skeleton
1. `Done criteria`
- `/api/v1` routing and middleware ready.
- Token auth working.
- Health endpoint live.
2. `Tasks`
- [ ] Configure MySQL + env separation (dev/staging).
- [ ] Finalize migration baseline for POS tables.
- [ ] Implement Auth endpoints (`login/logout`).
- [ ] Add RBAC guard (`owner/admin/kasir/kitchen` mapping).
- [ ] Add response envelope + error standard.
- [ ] Add request logging with `request_id`.

## Week 2: Transaction Engine
1. `Done criteria`
- Order create/add/pay/cancel complete with DB transaction safety.
2. `Tasks`
- [ ] Implement order state machine validations.
- [ ] Implement `add-item` with stock lock.
- [ ] Implement payment and double-submit protection.
- [ ] Implement cancel with stock restore movement.
- [ ] Add audit logs for critical transitions.
- [ ] Feature tests for race condition and payment integrity.

## Week 3: Master, QR, Shift, Sync
1. `Done criteria`
- Master and QR flow stable; sync pull/push available.
2. `Tasks`
- [ ] Implement products/tables endpoints.
- [ ] Implement QR token generation and rotation policy.
- [ ] Implement shift open/close and variance handling.
- [ ] Implement sync pull delta format.
- [ ] Implement sync push event processor and per-event result.
- [ ] Add idempotency key storage and replay response.

## Week 4: Hardening & UAT Prep
1. `Done criteria`
- API contract frozen for app/web integration.
- Operational baseline ready (logs, backup, smoke tests).
2. `Tasks`
- [ ] Publish OpenAPI v1 final.
- [ ] Add rate limit per sensitive endpoint.
- [ ] Add structured logs + sync failure alerts.
- [ ] Add DB backup/restore runbook.
- [ ] Build smoke/regression scripts for CI.
- [ ] UAT checklist for cashier + QR + admin.

## Backlog (Next 6 Weeks)
1. Next.js customer and admin UI.
2. Flutter offline queue and sync client.
3. Kitchen screen realtime updates.
4. Multi-outlet reporting and billing module.
5. Performance/load testing and production cutover.

## Risks & Mitigation
1. `Risk`: Stock race condition.
- Mitigation: lock rows + concurrency tests in CI.
2. `Risk`: Sync conflict complexity.
- Mitigation: idempotency + server authoritative rules.
3. `Risk`: Scope creep from custom requests.
- Mitigation: strict package tiers and add-on queue.

