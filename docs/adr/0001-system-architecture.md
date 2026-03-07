# ADR-0001: System Architecture for Cafe-X POS

## Status
Accepted

## Date
2026-03-06

## Context
Product target:
- Professional-grade POS.
- Affordable SaaS pricing for SME cafes.
- Offline-capable cashier app.
- QR table ordering for customer self-service.

Constraints:
- Fast delivery with small team.
- Strong consistency for payment/stock/shift.
- Operational simplicity for multi-tenant rollout.

## Decision
Use a **hybrid architecture**:
1. `Laravel API` as transactional core (modular monolith).
2. `Next.js` for customer QR web + admin web.
3. `Flutter` for cashier app (Android tablet + Windows desktop), offline-first with SQLite.
4. `MySQL` as source of truth; `Redis` for queue/cache/rate limit.
5. Multi-tenant model with `tenant_id` scoping in shared DB.
6. Sync model: POS app writes locally first, then pushes events with idempotency keys.

## Why this decision
1. Laravel is strong for transactional consistency and fast backend delivery.
2. Next.js gives modern UX and efficient web delivery for customer/admin.
3. Flutter allows one codebase for tablet and desktop cashier with offline mode.
4. Shared DB multi-tenant minimizes infra cost and keeps pricing affordable.

## Consequences
Positive:
1. Faster delivery and lower maintenance cost than microservices.
2. Stronger control for stock/payment correctness.
3. Product-market fit friendly for budget-sensitive cafes.

Tradeoffs:
1. Backend complexity remains in one large codebase (needs strict module boundaries).
2. Sync conflict handling must be carefully tested.
3. Scale-out requires disciplined indexing and background processing.

## Non-goals (Phase 1)
1. Full microservices decomposition.
2. Advanced franchise BI.
3. Custom accounting integration per tenant.

## Revisit conditions
Re-evaluate architecture when:
1. Active outlets > 1,000.
2. Peak throughput > 500 write TPS sustained.
3. Team size supports service ownership split.

