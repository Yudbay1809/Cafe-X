# Flutter POS UI – Design & Technical Plan

Purpose: Define the official Flutter POS UI scope, architecture, API contracts, offline strategy, and hand-off artifacts to FE and backend teams. This document is a standalone planning artifact that links back to the Cafe-X modular rebuild living plan.

## 1) Objective
- Provide an in-store POS frontend for cafe operators that interops with backend API v1, supports offline operation, and aligns with the design system tokens used across Landing Page, Admin Next, and Customer Next.
- Ensure secure, resilient interactions with the backend (auth, orders, payments, shift management) and hardware devices (barcode scanners, receipt printers).

## 2) Scope
- Platforms: Flutter POS app targeting Android/iOS tablets and compatible POS devices.
- Features: shift management, order creation, item addition, payment processing, order finalization, receipt printing, real-time sync when online.
- Non-goals: full replacement of web/mobile admin flows; not responsible for non-POS flows outside in-store operations.

## 3) Architecture Overview
- Client: Flutter app with clean architecture layers (Presentation, Domain/Usecases, Data, Infra).
- Backend integration: REST API endpoints exposed under /api/v1 (POS-related endpoints) with token-based authentication using the same auth tokens as API v1.
- State management: Provider or Riverpod (choose one per team preference) with offline queue.
- Offline strategy: local queue (SQLite or Hive) to store failed or pending transactions; retry/sync when network is restored.
- Data flow: tenant_id/outlet_id scoping for all POS operations, consistent with backend multi-tenant model.

## 4) Data Model Alignment (Backend support required)
- Core POS tables on backend: pos_shifts, pos_orders, pos_order_items, pos_payments, pos_sync_logs, plus references to tenant_id/outlet_id.
- Ensure foreign keys and indexes optimize read/write for POS workloads and support islanded operation during offline mode.
- API contracts will reference these resources with endpoints and payload formats described in section 6.

## 5) API Contracts (v1)
- Endpoints (initial/minimal set):
  - POST /api/v1/pos/shifts/start
  - POST /api/v1/pos/shifts/end
  - POST /api/v1/pos/orders
  - POST /api/v1/pos/order-items
  - POST /api/v1/pos/payments
  - POST /api/v1/pos/sync
  - GET /api/v1/product
  - GET /api/v1/outlet/config
- Payloads: follow the canonical request shapes used by other modules (e.g., Order upserts, Payment requests) and include tenant_id/outlet_id derived from auth_user context.
- Response: standard ApiResponse wrapper with data, error fields, and metadata (e.g., pagination or sync status).
- Security: token-based; idempotent operations for writes when possible; proper error codes.

## 6) Offline-First & Sync Strategy
- Local queue: store transactions locally when offline (orders, payments), with retry logic.
- Sync: background synchronization on regaining connectivity; handle conflicts via tenant/outlet scoping and predictable reconciliation rules.
- Idempotency: ensure repeated submissions do not create duplicate records.

## 7) Hardware & UX Considerations
- Hardware: barcode scanner inputs, receipt printer, and device status indicators.
- UX: responsive layouts, clear status indicators for network/offline state, accessible controls, and keyboard accessibility in addition to touch.
- Design tokens: rely on shared tokens from the FE plan for color, typography, spacing, and component styling.

## 8) Security & Authentication
- Use the same API token mechanism as API v1; reuse the token lifecycle (expiry, revocation).
- Role-based access for POS actions (e.g., cashier vs admin supervisor).
- Data minimization for logs and audit events related to POS actions.

## 9) UI/UX Design & Tokens
- Create a Flutter-friendly design system aligned with web FE tokens (colors, typography, spacing, radii).
- Define reusable widgets/components for POS screens (OrderCard, ItemList, Cart, CheckoutButton, CashUp, ReceiptPanel).
- Document UI interactions and accessibility notes, including focus order, contrast ratios, and text sizes suitable for small screens.

## 10) Testing Strategy
- Unit tests for usecases and repositories.
- Integration tests for API interaction (mocked backend) and hardware input flows.
- End-to-end tests for POS workflow including offline scenario and sync.
- Manual exploratory tests for edge-cases (offline mode, partial sync, network jitter).

## 11) CI/CD & Deployment
- Build pipeline to package Flutter app; ensure environment variables for API endpoints and tokens are injected securely.
- Automated tests in CI; artifact publishing for mobile apps and internal deployment.
- Rollback plan if a POS app update breaks in production.

## 12) Hand-off Artifacts
- Design tokens file (Flutter-compatible) and a shared token catalog.
- Component catalog and usage guidelines for common POS UI blocks.
- API client abstractions and endpoint usage examples for the internal team.
- Documentation: how to test offline mode and sync flows.

## 13) Acceptance Criteria
- POS app can authenticate and perform core flows against API v1.
- Offline-first queueing and sync work as expected with 100% data integrity on reconciliation.
- UI is consistent with shared design tokens and accessible.
- End-to-end POS purchase flow is covered by tests.

This document is intended as a living artifact; it will be updated as decisions are made and as backend contracts evolve.
