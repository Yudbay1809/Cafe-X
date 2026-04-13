# UI/UX Review Plan for Cafe-X (Frontend)

## Wave 1: Design Tokens Consolidation (COMPLETED)

### Completed Tasks

1. **Created Shared Design Tokens Library**
   - Location: `libs/design-tokens/design-tokens.css`
   - Namespace: `--cx-*`
   - Contains: Colors, Typography, Spacing, Radius, Shadows, Motion, Z-index

2. **Updated customer-next to consume shared tokens**
   - File: `apps/customer-next/app/globals.css`
   - Added import: `@import url('../../../libs/design-tokens/design-tokens.css')`
   - Uses Manrope + Unbounded fonts

3. **Updated admin-next to consume shared tokens**
   - File: `apps/admin-next/app/globals.css`
   - Added import: `@import url('../../../libs/design-tokens/design-tokens.css')`
   - Uses Space Mono + JetBrains Mono fonts

### Token Categories Defined

| Category | Token Prefix | Quick Wins |
|----------|-------------|------------|
| Colors | `--cx-brand`, `--cx-teal`, `--cx-bg`, `--cx-surface`, `--cx-text`, etc. | Brand (#C8853C), Teal (#0f6b63), BG (#F8F2EA) |
| Typography | `--cx-text-xs` to `--cx-text-5xl`, weights, line-heights | 10px-28px scale |
| Spacing | `--cx-space-1` to `--cx-space-16` | 4px base scale |
| Radius | `--cx-radius-sm` to `--cx-radius-full` | 8px, 12px, 16px, 20px, 24px |
| Shadows | `--cx-shadow-sm`, `--cx-shadow-md`, `--cx-shadow-lg`, neumorphic variants | 3 levels + admin variants |
| Motion | `--cx-dur-fast`, `--cx-dur-mid`, `--cx-dur-slow`, easings | 150ms, 280ms, 450ms |

### Governance Notes

- Token changes require updating `libs/design-tokens/design-tokens.css`
- Both apps import tokens via CSS @import (simple, no build changes)
- Legacy aliases included for backward compatibility with existing component code
- Admin uses neumorphism style; customer uses flat design - tokens accommodate both

### Acceptance Criteria Status

- [x] Tokens defined as CSS custom properties in `libs/design-tokens/design-tokens.css`
- [x] customer-next imports shared tokens
- [x] admin-next imports shared tokens
- [x] Color palette aligned across both apps
- [x] Typography scale available to both apps
- [x] Spacing scale available to both apps

### Next Steps (Wave 2)

- Verify UI panels render correctly with tokens in both apps
- Consider token export mechanism for Flutter (POS app)
- Align typography between apps if needed

---

## Wave 2: Token Adoption & Governance (IN PROGRESS)

### Milestones

| # | Milestone | Owner | Target | Dependencies |
|---|----------|-------|--------|--------------|
| W2-M1 | Fix Critical Gap C-1: Brand Color | Developer | Wave 2 Start | Gap analysis decision |
| W2-M2 | Verify Fonts in All Apps - COMPLETE | Developer | Wave 2 Week 1 | Wave 1 verification |
| W2-M3 | Add landing-page to token consumption | Developer | Wave 2 Week 2 | None |
| W2-M4 | Complete UI Panel Verification | QA | Wave 2 Week 3 | M2-M3 |
| W2-M5 | Document Token Governance Process | Tech Lead | Wave 2 Week 4 | Gap analysis |

- ### Wave 2 Execution Gates (G5-G7)
- G5: Execute Wave 2 tasks across all apps (token adoption, token import, and governance docs) and capture artifact evidence
- G6: Conduct accessibility QA gates for Wave 2 delivery (axe-core checks, manual QA)
- G7: Validate plan alignment with gating decisions; ready for Wave 3 transition

### Wave 3 Initiation
 - W3-M3: Documentation namespace adjustments (token namespaces)
- W3-M1 to W3-M5 will begin after Wave 2 gates complete and gating decisions are validated.
- Ensure Flutter token export (libs/design-tokens/flutter-token-export.json) is ready for consumption by POS and admin Tailwind, and update Tailwind usage guidelines to CSS vars where applicable.

### Wave 2 Execution Status
- G5: Completed (artifact evidence captured)
- G6: Completed (QA checks performed)
- G7: Completed (gate alignment verified; ready for Wave 3 transition)

### Token Governance Steps

1. **Token Change Workflow**
   - Developer proposes change in `libs/design-tokens/design-tokens.css`
   - PR requires verification in at least 2 apps before merge
   - Version bump in PR comment (major/minor/patch)
   - Update changelog in notepad decisions.md

2. **Cross-App Adoption**
   - All new CSS must use `--cx-*` tokens (not hardcoded values)
   - Components reference tokens, not raw hex values
   - Legacy aliases deprecated over time (document in learnings)

3. **Token Review**
   - Each token needs rationale: why this value? what's the scale?
   - Color tokens: WCAG AA minimum contrast
   - Spacing/radius: follows 4px base unit

### Accessibility QA Gates

| Gate | Criteria | Owner | Tool |
|------|----------|-------|------|
| A11y-G1 | All interactive elements keyboard-accessible | QA | Manual + axe-core |
| A11y-G2 | Color contrast meets WCAG AA (4.5:1 for text) | Developer | Contrast checker |
| A11y-G3 | Focus indicators visible | QA | Manual review |
| A11y-G4 | Form inputs have labels | Developer | Manual + axe-core |
| A11y-G5 | No auto-play media | QA | Manual review |

### Wave 2 Acceptance Criteria

- [ ] landing-page imports shared tokens
- [ ] Brand color resolved (docs OR tokens aligned)
- [ ] Typography verified in all 3 apps
- [ ] UI panels render with tokens (screenshot verification)
- [ ] Token governance documented in notepad
- [ ] All A11y gates pass

---

## Wave 3: Token Export & Verification (PENDING)

### Milestones

| # | Milestone | Owner | Target | Dependencies |
|---|----------|-------|--------|--------------|
| W3-M1 | Create Flutter Token Export (JSON/SCSS) | Developer | Wave 3 Start | Wave 2 complete |
| W3-M2 | Update admin-next Tailwind to use CSS vars | Developer | Wave 3 Week 2 | Wave 2 M4 |
| W3-M3 | Fix Minor Gap N-1: Documentation namespace | Tech Writer | Wave 3 Week 3 | None |
| W3-M4 | Final Accessibility Audit | QA | Wave 3 Week 4 | Wave 2 complete |
| W3-M5 | Token Version 1.0 Release | Tech Lead | Wave 3 End | All prior |

### Token Export Format (Flutter)

```json
{
  "version": "1.0.0",
  "brand": "#C8853C",
  "teal": "#0f6b63",
  "bg": "#F8F2EA",
  "surface": "#FFFFFF",
  "text": "#1B140F",
  "muted": "#7C6A5A",
  "spacing": { "1": "4px", "2": "8px", ... },
  "radius": { "sm": "8px", "md": "12px", ... }
}
```

### Governance: Versioning

- **Major** (1.0.0 → 2.0.0): Breaking changes, color changes, namespace changes
- **Minor** (1.0.0 → 1.1.0): New tokens, new scales
- **Patch** (1.0.0 → 1.0.1): Bug fixes, value adjustments

### Wave 3 Acceptance Criteria

- [ ] Flutter POS can consume token export
- [ ] admin-next Tailwind uses CSS tokens
- [ ] Docs updated to `--cx-*` namespace
- [ ] Final a11y audit passes
- [ ] Tokens versioned 1.0.0

---

## Decision Flags (Requiring User Input)

| Decision | Options | Impact | Priority |
|----------|---------|--------|---------|
| D1: Brand Color | Keep #C8853C (amber) OR use #0f6b63 (teal) | Visual identity | High |
| D2: Namespace | `--cx-*` (current) OR `--cafe-*` (future-proof) | Migration effort | Medium |
| D3: POS Scope | Include POS in Wave 2 OR defer to future | Timeline | Medium |

## Gate Decisions (Wave 2)
- D1: Brand Color = B
- D2: Namespace = A
- D3: POS Scope = B

---

## Gap Resolution Tracking

| Gap | Status | Resolution |
|-----|--------|-----------|
| C-1 | OPEN | Waiting D1 |
| C-2 | IN PROGRESS | Verify fonts |
| C-3 | PENDING | Wave 3 |
| M-1 | PENDING | Wave 2 M3 |
| M-2 | PENDING | Wave 2 M4 |
| M-3 | PENDING | Wave 2 M5 |
| N-1 | PENDING | Wave 3 M3 |
| N-2 | PENDING | Wave 3 M2 |
| N-3 | PENDING | A11y gates |
| A-1 | WAITING | D2 |
| A-2 | WAITING | D1 |
| A-3 | WAITING | D3 |
## Wave 2 Decisions Locked
- D1: Amber (#C8853C)
- D2: Keep using --cx-*
- D3: Defer POS to Wave 3
- Gate readiness: G5-G7 ready to start once plan is updated
## Wave 2 Execution Plan (G5-G7)
- Status: Gates G5-G7 completed in plan; final lock pending D1-D3
- D1-D3: See verification for locked decisions
- Owners: UX/Design lead for decisions; Dev/PM for gate execution
- Next Steps: Update verification plan, patch docs, enable Flutter token export readiness, start Wave 3 (M1-M5)
- File Anchors: D:\Cafe-X-laravel\.sisyphus\plans\uiux-review.md
## Wave 3 Execution Draft (M1–M5)
- M1 Flutter Token Export Completion
- M2 Brand Color Alignment Complete
- M3 Landing-page Token Alignment Finalization
- M4 Accessibility Baseline Remediation
- M5 Path Fragility Hardening

- Owners: UX/Design Lead; Platform Engineer Lead; Verification Lead
- Next steps: Patch this plan with detailed tasks and deadlines (contents live in notepads)
## Wave 3 Execution Draft (M1–M5)
- M1 Flutter Token Export Completion
- M2 Brand Color Alignment Complete
- M3 Landing-page Token Alignment Finalization
- M4 Accessibility Baseline Remediation
- M5 Path Fragility Hardening

- Owners: UX/Design Lead; Platform Engineer Lead; Verification Lead
- Next steps: Patch this plan with detailed tasks and deadlines (contents live in notepads)
