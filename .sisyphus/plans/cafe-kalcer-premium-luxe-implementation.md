# Cafe Kalcer Premium Luxe Design Implementation Plan

**Project:** Cafe Digital Order System - Premium Luxe Theme
**Stitch Project ID:** 988021682672932349
**Created:** 2026-04-18
**Last Updated:** 2026-04-18
**Status:** In Progress (Phase 1-3 Complete)

---

## 1. Executive Summary

This plan outlines the implementation of a Premium Luxe visual design theme for Cafe Kalcer using the Stitch MCP design system. The theme elevates the existing "Digital Sommelier" design system with richer colors, more elegant typography, and sophisticated animations while maintaining WCAG AA accessibility compliance.

**Key Deliverables:**
- Premium Luxe CSS design tokens (data-theme="premium" activation)
- .stitch/DESIGN.md entry with theme documentation
- Global token imports updated in customer-next and admin-next
- Three design variants documented
- Screen patches for 4 key screens
- QA validation plan

---

## 2. Completed Work (Phase 1-3)

### Phase 1: Token Foundation ✅

| Task | Status | File(s) Modified |
|------|--------|----------------|
| Create Premium Luxe CSS tokens | COMPLETE | `libs/design-tokens/design-tokens.css` (lines 328-450) |
| Add 9. Premium Luxe Theme section | COMPLETE | New section with 40+ CSS custom properties |
| Define premium color palette | COMPLETE | Rich Espresso (#1a0f0a), Aged Copper (#b8860b), Antique Gold (#c9a227) |
| Define premium typography | COMPLETE | Newsreader + Plus Jakarta Sans with increased sizes |
| Define premium spacing/radius/shadows | COMPLETE | More generous values with gold glow effects |
| Define premium motion tokens | COMPLETE | Slower, more elegant easing |

**Activation Method:**
```html
<html data-theme="premium"> <!-- or -->
<div class="premium-luxe">
```

### Phase 2: DESIGN.md Entry ✅

| Task | Status | File(s) Modified |
|------|--------|----------------|
| Add Premium Luxe section to DESIGN.md | COMPLETE | `.stitch/DESIGN.md` (Section 12) |
| Document premium color palette | COMPLETE | Token table with hex values |
| Document premium typography | COMPLETE | Display sizes and letter spacing |
| Document premium spacing/radius | COMPLETE | Comparison with base theme |
| Add activation instructions | COMPLETE | Code examples for data-theme |
| Add runtime toggle option | COMPLETE | React component example |
| Document design variants | COMPLETE | Section 13 - 3 variants |

### Phase 3: Global Token Imports ✅

| Task | Status | File(s) Modified |
|------|--------|----------------|
| Update customer-next globals.css | COMPLETE | `apps/customer-next/app/globals.css` |
| Update admin-next globals.css | COMPLETE | `apps/admin-next/app/globals.css` |
| Add theme activation helper | COMPLETE | CSS custom properties for theme state |
| Document premium theme notes | COMPLETE | Added to file headers |

---

## 3. Pending Work (Phase 4-6)

### Phase 4: Design Variants Documentation

| Variant | Description | Status |
|---------|-------------|--------|
| Premium Luxe | Baseline - warm coffee tones, gold accents | COMPLETE |
| Contemporary Minimal | Monochromatic, sharp corners, flat design | COMPLETE |
| Modern Organic | Earthy tones, soft shapes, natural shadows | COMPLETE |

**Token Mapping Notes (in DESIGN.md):**
- All 3 variants documented with comparison table
- Each variant includes: primary, secondary, accent, surface, radius, font, shadow, motion

### Phase 5: Screen Patches 🔄

| Screen | Location | Status | Priority |
|--------|----------|--------|----------|
| Dashboard (POS) | `apps/pos-flutter/lib/ui/screens/ops_dashboard.dart` | PENDING | HIGH |
| Dashboard (Admin) | Found via grep | PENDING | HIGH |
| QR Generator | `apps/admin-next/app/qr/page.tsx` | PENDING | HIGH |
| Customer Loyalty | `apps/admin-next/app/loyalty/` | PENDING | MEDIUM |
| Order Notifications | `apps/pos-flutter/lib/ui/screens/` | PENDING | MEDIUM |

**Patch Approach:**
1. For Flutter (POS): Update theme with Color scheme mapping
2. For Next.js (Admin): Apply CSS classes using premium tokens
3. Create patch diffs for review before merging

### Phase 6: QA Validation 📋

| Check | Method | Status |
|-------|--------|--------|
| Contrast ratio | WCAG AA check (4.5:1 minimum) | PENDING |
| Typography consistency | Visual inspection | PENDING |
| Spacing grid alignment | Pixel measurement | PENDING |
| Accessibility | Focus states, ARIA labels | PENDING |
| Visual regression | Screenshot comparison | PENDING |

**Test Cases (JSON format):**
```json
{
  "test_suite": "premium-luxe-qa",
  "tests": [
    {"id": "PL-001", "name": "Contrast - Primary on Surface", "criteria": "≥4.5:1"},
    {"id": "PL-002", "name": "Contrast - Secondary on Surface", "criteria": "≥4.5:1"},
    {"id": "PL-003", "name": "Typography - Display scale", "criteria": "Newsreader 4rem"},
    {"id": "PL-004", "name": "Spacing - Grid alignment", "criteria": "Multiple of 4px"},
    {"id": "PL-005", "name": "Accessibility - Focus ring", "criteria": "Visible on keyboard nav"},
    {"id": "PL-006", "name": "Motion - Duration", "criteria": "≤500ms"}
  ]
}
```

---

## 4. Collaboration Skills Used

| Skill | Role in Implementation |
|-------|----------------------|
| stitch-design | MCP design work, prompt enhancement, routing |
| design-token-branding | Design token system creation |
| taste-design | Premium Luxe specifics (colors, mood) |
| ui-art-direction | Visual language definition |
| memory-merger | Documentation for future reference |

---

## 5. Technical Details

### Premium Luxe Token Summary

**Colors:**
```
--cx-premium-primary: #1a0f0a (Rich Espresso)
--cx-premium-secondary: #b8860b (Aged Copper)
--cx-premium-accent: #c9a227 (Antique Gold)
--cx-premium-surface: #fdfbf7 (Ivory Parchment)
--cx-premium-glow: rgba(201, 162, 39, 0.15)
```

**Typography:**
```
--cx-premium-font-display: 'Newsreader', Georgia, serif
--cx-premium-font-body: 'Plus Jakarta Sans', system-ui, sans-serif
--cx-premium-display: 4rem
--cx-premium-headline: 2.5rem
--cx-premium-body: 1.0625rem
```

**Motion:**
```
--cx-premium-ease: cubic-bezier(0.22, 1, 0.36, 1)
--cx-premium-dur-fast: 200ms
--cx-premium-dur-mid: 350ms
--cx-premium-dur-slow: 500ms
```

### File Changes Summary

| File | Change Type | Lines |
|------|------------|-------|
| `libs/design-tokens/design-tokens.css` | ADD | +120 lines (Premium Luxe section) |
| `.stitch/DESIGN.md` | ADD | +80 lines (Sections 12-13) |
| `apps/customer-next/app/globals.css` | MODIFY | +10 lines (theme activation) |
| `apps/admin-next/app/globals.css` | MODIFY | +10 lines (theme activation) |

---

## 6. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Stitch MCP connected | ✅ VERIFIED | 2 projects available |
| Design tokens library | ✅ EXISTS | v2.0.0 |
| customer-next app | ✅ EXISTS | Port 3000 |
| admin-next app | ✅ EXISTS | Port 3002 |
| pos-flutter app | ✅ EXISTS | Flutter app available |

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token drift across apps | UI inconsistency | Single source of truth in shared library |
| Accessibility violation | WCAG non-compliance | Pre-check contrast ratios |
| Regression in existing UI | Breaking changes | Test on dev environment first |
| Performance impact | Slower animations | Keep premium motion ≤500ms |

---

## 8. Next Steps (Priority Order)

1. **Complete screen patches** (Phase 5)
   - Identify exact component locations in each app
   - Apply premium CSS classes
   - Create patch diffs for review

2. **Execute QA validation** (Phase 6)
   - Run contrast checks
   - Validate typography
   - Check accessibility

3. **Memory documentation**
   - Use memory-merger skill to document lessons
   - Save to workspace memory

---

## 9. Acceptance Criteria

- [x] Premium Luxe tokens defined in design-tokens.css
- [x] Activation works via data-theme="premium"
- [x] DESIGN.md entry complete with 3 variants
- [x] customer-next imports updated
- [x] admin-next imports updated
- [ ] Screen patches applied to 4 screens
- [ ] QA validation passed
- [ ] No breaking changes in existing UI

---

## 10. Reference Files

- Design tokens: `libs/design-tokens/design-tokens.css`
- DESIGN.md: `.stitch/DESIGN.md`
- customer-next: `apps/customer-next/app/globals.css`
- admin-next: `apps/admin-next/app/globals.css`
- Implementation plan: `.sisyphus/plans/premium-luxe-design.md`

---

*Generated: 2026-04-18*
*Plan Owner: Sisyphus (Orchestrator)*
*Session: ses_premium_luxe*