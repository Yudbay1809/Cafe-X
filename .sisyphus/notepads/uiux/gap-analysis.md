# Cafe-X UI/UX Gap Analysis

## Analysis Date: 2026-04-11

## Wave 1-3 Deliverables Review

### Deliverables Identified
1. **Design Tokens**: `libs/design-tokens/design-tokens.css` - complete
2. **App Integration**: customer-next, admin-next consuming tokens - complete  
3. **Typography**: Updated to Unbounded + Manrope per learnings
4. **Design System Docs**: `docs/uiux/design-system-cafe-x.md` - exists

---

## Gap Catalog

### Critical Gaps (Block Wave 2 adoption)

| Gap ID | Category | Finding | Rationale | Remediation |
|-------|---------|---------|----------|------------|
| C-1 | Token Inconsistency | design-system.md defines `--brand: #0f6b63` (teal) but tokens use `#C8853C` (amber) | Brand color mismatch across docs vs actual tokens | Update design-system.md to match tokens OR update tokens to match docs. Requires decision. |
| C-2 | Typography Import | learnings.md says fonts updated but no evidence in globals.css | Font updates mentioned in learnings but not verified in code | Verify fonts in customer-next, admin-next, landing-page globals.css |
| C-3 | Token Export | No mechanism for Flutter/POS to consume tokens | Wave 1 plan mentions POS app but no token export created | Create token export (SCSS or JSON) for Flutter consumption |

### Major Gaps (Risk Wave 2 outcomes)

| Gap ID | Category | Finding | Rationale | Remediation |
|-------|---------|---------|----------|------------|
| M-1 | Landing Page | Not in Wave 1 scope but uses different fonts | landing-page app exists but not token-aligned | Add landing-page to token consumption (Wave 2) |
| M-2 | Verification | No UI panel verification completed | Plan mentions verification but not done | Run dev servers, verify token rendering |
| M-3 | Governance | No formal token change process defined | Team wants governance but process unclear | Document token change workflow in notepad |

### Minor Gaps (Low risk, polish)

| Gap ID | Category | Finding | Rationale | Remediation |
|-------|---------|---------|----------|------------|
| N-1 | Documentation | design-system.md uses old namespace `--brand`, `--bg` | Docs should align with `--cx-*` namespace | Update docs to use `--cx-*` prefix |
| N-2 | Tailwind Config | admin-next uses Tailwind but no token sync | Tailwind theme doesn't reference CSS tokens | Consider extending Tailwind from CSS vars |
| N-3 | Accessibility | No accessibility verification done | Plan mentions accessibility baseline but no checks | Add basic a11y checklist to notepad |

### Ambiguous (Needs clarification)

| Gap ID | Category | Finding | Rationale | Remediation |
|-------|---------|---------|----------|------------|
| A-1 | Namespace | Should tokens use `--cx-*` or `--cafe-*`? | Namespace decision unclear long-term | Confirm namespace convention |
| A-2 | Color Sync | admin uses #006666, customer uses #C8853C - is this intentional? | Two apps have different brand colors | Clarify if intentional or alignment needed |
| A-3 | Flutter Scope | POS app not in original Wave 1 but referenced | Scope drift - unclear if POS included | Confirm POS app scope for Wave 2 |

---

## Gap Analysis Update: 2026-04-11 (Metis Review)

### Cross-Reference Findings

Verified against:
- `docs/uiux/design-system-cafe-x.md` (documentation)
- `.sisyphus/notepads/uiux/verification.md` (Wave 3 verification)
- `.sisyphus/notepads/uiux/learnings.md` (Wave 1-2 context)
- `.sisyphus/plans/uiux-review.md` (plan with decision flags)

### Hidden Gaps Identified (Metis)

| Gap ID | Category | Finding | Rationale | Remediation |
|--------|---------|---------|----------|------------|
| H-1 | DOCUMENTED | Import uses relative path `../../libs/...` | Requires monorepo setup | Needs npm workspace or path alias in tsconfig |
| H-2 | No Rollback Mechanism | No version rollback if breaking token change deployed | Risk: breaking change goes live with no recovery | Document rollback procedure in token-governance.md |
| H-3 | Performance Impact | CSS @import is render-blocking | Large token file blocks initial render | Consider `<link rel="preload">` or async loading |
| H-4 | RESOLVED | prefers-reduced-motion exists in all 3 apps | Verified in globals.css |
| H-5 | Screen Reader Testing | No ARIA token documentation | Tokens don't account for a11y attributes | Document aria-* usage alongside tokens |
| H-6 | Flutter Theme Mismatch | Docs show `#0f6b63` brand, verification shows `#C8853C` | Inconsistency between documentation and actual values | Resolve C-1 first |
| H-7 | Cross-Browser Baseline | No browser support matrix | Unknown compatibility with older browsers | Add browser matrix to token-governance.md |
| H-8 | Token Migration Path | No guide for future migration to new namespace | A-1 (namespace) decision lacks implementation plan | Document migration script/strategy for Wave 2 |

### Gap Status Reconciliation

| Original Gap | Verified Status | Notes |
|-------------|-----------------|-------|
| C-1 | RESOLVED | D1=A (Amber #C8853C) locked - brand color aligned |
| C-2 | RESOLVED | Verified in verification.md - fonts correct in both apps |
| C-3 | PENDING | Still needed for Flutter |
| M-1 | PENDING | landing-page still not token-aligned |
| M-2 | PARTIAL | Manual verification done, automated pending |
| M-3 | RESOLVED | token-governance.md now exists |
| N-1 | PENDING | Docs still use old namespace |
| N-2 | PENDING | Tailwind not synced |
| N-3 | PENDING | No axe-core run |
| A-1 | DECISION PENDING | Still needs D2 decision |
| A-2 | DECISION PENDING | Related to C-1 |
| A-3 | DECISION PENDING | Related to D3 |

### Risk Points Requiring Immediate Attention

1. **Brand Color (C-1)**: Blocks all Wave 2 work - documentation and tokens disagree
2. **Build Path (H-1)**: Fragile relative path could break with refactoring
3. **Accessibility (H-4)**: Missing reduced-motion support is compliance gap
4. **Flutter Export (C-3)**: POS app cannot consume tokens without export

### Recommended Wave 2 Priority Order

1. **Phase 1** (Week 1-2): Resolve C-1 (brand color decision), Resolve H-1 (path alias)
2. **Phase 2** (Week 3-4): Complete M-2 (UI verification), Add landing-page (M-1)
3. **Phase 3** (Week 5-6): Governance review, accessibility baseline (H-4)
4. **Phase 4** (Wave 3): Flutter export (C-3), Tailwind sync (N-2)

### Decisions Needed (from Plan)

| Decision | Status | Owner |
|----------|--------|-------|
| D1: Brand Color | AWAITING USER INPUT | User must choose #C8853C or #0f6b63 |
| D2: Namespace | A (Keep --cx-*) [Completed] | User chose to keep current namespace: --cx-* and confirmed in Wave 2 gating |
| D3: POS Scope | B (Defer) [Completed] | User chose to defer POS to Wave 3 to focus on web apps |

### Gap Summary Update

- **Critical**: 4 gaps (C-1 brand color, C-2 font verified, C-3 Flutter export, H-1 build path)
- **Major**: 3 gaps (M-1 landing-page, M-2 verification, M-3 governance resolved)
- **Minor**: 5 gaps (N-1 docs, N-2 Tailwind, N-3 a11y, H-3 performance, H-7 browser)
- **Ambiguous**: 3 gaps (A-1 namespace, A-2 color sync, A-3 POS scope)
- **Hidden**: 2 gaps (H-4 reduced-motion, H-5 ARIA)

---
*Appended: 2026-04-11 - Metis review cross-referenced all Wave 1-3 artifacts*
