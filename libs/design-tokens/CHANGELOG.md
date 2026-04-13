# Cafe-X Design Tokens Changelog

All notable changes to this design token system will be documented in this file.

## [1.0.0] - 2026-04-11

### Added
- Version metadata tokens: `--cx-token-version`, `--cx-last-updated`
- Governance policy documentation inline in CSS
- Deprecation notice section with timeline

### Token Categories
- **Color**: Brand (`--cx-brand`, `--cx-brand-deep`, `--cx-brand-light`), Surfaces, Text, Status
- **Typography**: Font sizes (xs to 5xl), weights, line heights
- **Spacing**: 4px-based scale (0 to 16)
- **Radius**: sm, md, lg, xl, 2xl, full
- **Shadow**: sm, md, lg, brand, neumorphic variants
- **Motion**: ease-out, ease-in, duration tokens
- **Z-index**: layering scale

### Backward Compatibility
- Legacy aliases preserved: `--c-*` (customer-next), `--cx-*` (admin-next), `--bg`, `--panel`, `--accent`, etc.
- Deprecated `--c-*` and legacy tokens will be removed in v2.0.0
- All current aliases maintained for minimum 2 minor version cycles

### Migration Guide
Apps using legacy tokens should migrate to `--cx-*` prefix:
| Legacy | Recommended |
|--------|-----------|
| `--c-brand` | `--cx-brand` |
| `--c-bg` | `--cx-bg` |
| `--c-surface` | `--cx-surface` |
| `--c-text` | `--cx-text` |
| `--dur-fast` | `--cx-dur-fast` |
| `--ease` | `--cx-ease-out` |

## Future Plans
- Quarterly token review cycle (Q1, Q2, Q3, Q4)
- Token name audit for consistency
- Potential dark mode tokens in v1.1.0

---

## [Release Notes] Wave 1-3 Complete - 2026-04-12

### Summary
All Wave 1-3 deliverables complete. Design tokens now unified across 3 apps.

### Wave 1: Design Tokens Consolidation (Complete)
- Shared token library: `libs/design-tokens/design-tokens.css`
- 50+ CSS custom properties across 7 categories
- Version 1.0.0 with governance

### Wave 2: Token Adoption (Complete)
- customer-next imports shared tokens
- admin-next imports shared tokens  
- landing-page imports shared tokens
- D1-D3 decisions locked: A, A, B

### Wave 3: Token Export (Complete)
- Flutter token export: `flutter-token-export.json`
- SCSS export: `flutter-token-export.scss`
- Accessibility baseline established
- Path fragility documented

### Decisions Locked
- D1: Brand Color = A (Amber #C8853C)
- D2: Namespace = A (Keep --cx-*)
- D3: POS Scope = B (Defer to future)

### Next Steps (Optional)
- Monorepo setup for path resolution
- Tailwind sync to CSS variables