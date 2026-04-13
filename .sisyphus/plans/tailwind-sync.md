# Tailwind Sync Plan (Wave 2-3)

## TL;DR
- Objective: unify Tailwind color palette across customer, admin, and landing pages by mapping Tailwind colors to CSS tokens exposed in libs/design-tokens/design-tokens.css, so design tokens drive styling consistently.
- Approach: extend Tailwind config in all three apps to reference CSS variables, and progressively migrate components to use Tailwind tokens instead of hard-coded hex values where feasible. Validate via build, lint, and a minimal QA pass.

## Context
- Wave 2 already covered gating; Tailwind tokens now exist in design-tokens.css and 3 apps import them.
- A monorepo path alias is in progress (B2) to simplify imports; Tailwind changes should not break path resolution.

## Work Objectives
- O1: Extend Tailwind config in customer-next, admin-next, and landing-page to expose tokens as color references (e.g., brand, teal, bg, surface, text, muted).
- O2: Replace host app color references (where used) with Tailwind color utilities wired to CSS vars (as available).
- O3: Ensure design-token-driven tokens are usable in Tailwind utilities across all three apps.
- O4: Update minimal documentation on token usage within Tailwind for future contributors.

## Verification Strategy (Agent-Executed)
- Build the three apps and verify no color-related runtime errors.
- Lint TS/JS for color usage consistency.
- Basic Playwright/UI check to ensure core screens render with tokens.
- Validate accessibility contrast remains compliant with tokens.

## Execution Strategy
- Wave 1: Establish token mappings in Tailwind (colors).
- Wave 2: Replace or wrap a subset of components to use Tailwind color tokens.
- Wave 3: Full migration where feasible, and document limitations.

---

## Wave 2-3 TODOs
- [x] 1. Extend tailwind.config.js for all apps to reference CSS vars from design-tokens.css
- [x] 2. Audit and migrate representative components to Tailwind token utilities
- [x] 3. Verify build succeeds without color-related errors
- [x] 4. Update design-tokens docs / governance notes for Tailwind usage
- [x] 5. Prepare QA scenarios for color consistency checks

---

## Final Verification Wave
- [x] Build pass for customer-next, admin-next, landing-page
- [x] No color mismatches after token-based changes
- [x] Accessibility checks pass with the updated palette

## Commit Strategy
- type(scope): description
