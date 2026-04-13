# Cafe-X Modular Rebuild – Living Plan
This document is the living plan for the Cafe-X Laravel backend (modular, multi-tenant) and frontend apps (Next.js admin/customer/landing, Flutter POS integration). It aggregates architectural decisions, API contracts, migration/rollout strategies, and design/system plans.

## 1. Status & Context
- Backend architecture plan: DONE
- Plan Deep-1 sprint plan: DONE
- FE UI/UX plan: IN PROGRESS
- Flutter POS UI integration: part of FE plan
- Basis database: PostgreSQL as primary DB, non-destructive migrations, backups, seeds, CI/CD provisioning
- API contracts for FE: to be documented in API contracts section

## 2. Architecture Overview
- Backend: Laravel 12, PHP 8.2, modular structure under backend/app/Modules
- Frontend: apps/landing-page, apps/admin-next, apps/customer-next; Flutter POS interacts via backend API
- API: /api/v1 with module routes loaded via module-specific routes.php
- Multi-tenant: scope via auth_user (tenant_id/outlet_id)
- Observability: AuditService
- Data model: tenants → outlets, products, orders, etc. with tenant_id/outlet_id scoping

## 3. Module Decomposition & Boundaries
- Shared
- Auth
- Customer
- Delivery
- Loyalty
- Outlet
- POS
- Product
- Order
- Report
- Billing
- Inventory
- Payment
- Data ownership and cross-module interactions

## 4. API Surface (v1)
- Versioning: /api/v1/*
- Authentication: token-based; api.token middleware
- Endpoints: per module (Auth: login/me; Product: index/store/update/destroy; Order: create/confirm; etc.)
- Error handling: standardized ApiResponse errors
- OpenAPI planning: skeleton outline to start

## 5. Data Migration & Rollout
- Strategy: non-destructive migrations; seeds; backups
- Phases: baseline schema → incremental migrations → data seeding
- Rollback: migration rollback scripts or backups

## 6. Backend Migration & Deployment
- CI/CD: install deps (composer/npm), run migrations in CI, artifact packaging
- Environments: dev/stage/prod; environment management
- Backups/Restore: DB backups; restore procedures

## 7. Frontend UI Plan (FE)
- Landing Page UI: design tokens, components, accessibility, multi-tenant branding hooks
- Admin Next UI: dashboards, tables, forms
- Customer Next UI: storefront/customer portal
- Flutter POS UI: API integration points; offline planning
- Design tokens and design system: tokens file, Tailwind config or CSS variables, component specs
- Accessibility and responsive design
- Branding: multi-tenant hooks

## 8. UI/UX Deliverables (UI Pro Max)
- Design system tokens, components catalog, wireframes, and hand-off artifacts
- Shared branding across apps
- Hand-off package for FE engineers

## 9. Testing & Quality
- Unit/integration tests for backend/frontend
- E2E tests for critical flows (order, payment, admin tasks)
- Lint/type checks; CI gates

## 10. Acceptance Criteria
- Backend modularization with defined boundaries and module mappings
- API contracts v1 documented and validated with FE needs
- Multi-tenant scoping verified; audit logging in place
- FE design system ready for implementation; UI tokens consistent across apps
- Flutter POS integration points defined

## 11. Milestones & Next Steps
- Milestone 1: Publish living document; confirm scope
- Milestone 2: Begin FE sprint planning aligned to backend
- Milestone 3: Start module-by-module integration tests

## 12. Risks & Mitigations
- UI resources availability: use plan artifacts and hand-off if UI designer is not ready
- Migration risk: non-destructive migrations, backups, rollback plan
- API contract drift: versioned contracts and CI validation

Note: This is a living document. We will populate details as background tasks complete and as stakeholder feedback comes in.
