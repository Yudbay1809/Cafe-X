# API Changelog v1

## 2026-03-06
- Initial stable `/api/v1` release.
- Added token auth, role/permission middleware, and idempotency support.
- Added strict order status enum: `new/preparing/ready/served/paid/canceled`.
- Added payment method enum: `cash/qris/transfer/card/other`.
- Added sync push/pull with per-event result payload.

## Breaking-change policy
- Any incompatible change must be released under a new version prefix (`/api/v2`).
- `v1` remains backward-compatible for additive fields/endpoints only.
