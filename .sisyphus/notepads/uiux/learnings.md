# Cafe-X Design Tokens - Learnings

## Wave 1 Completed: Design Tokens Consolidation

### Key Decisions Made

1. **Shared token location**: Created `libs/design-tokens/design-tokens.css` (not packages/) since this is a simple CSS library, not a JS package requiring build tooling.

2. **Namespace strategy**: Used `--cx-*` prefix (Cafe-X) following the existing admin-next convention (`--cx-*`). This provides clear namespacing and avoids conflicts.

3. **Import strategy**: Used CSS `@import url()` to import shared tokens. This is the simplest approach - no build config changes needed in either app.

4. **Backward compatibility**: Included legacy aliases (`--c-*` for customer, `--cx-*` for admin) so existing component CSS continues to work without refactoring.

### Color Palette Alignment

- **Brand**: #C8853C (amber/caramel) - customer app
- **Teal**: #0f6b63 - shared accent
- **Background**: #F8F2EA (warm cream) - customer
- **Background**: #E7E5E4 (gray) - admin (neumorphism)
- Both apps now share the same token definitions but can have different surface colors due to design differences

### Typography Notes (Updated 2026-04-11)

- **NEW Brand Typography**: Unbounded (headings) + Manrope (body) - per brand guidelines
- Updated ALL 3 apps to align:
  - customer-next: Unbounded (headings) + Manrope (body)
  - admin-next: Unbounded (headings) + Manrope (body)
  - landing-page: Unbounded (display) + Manrope (body)
- Fallbacks: system-ui, -apple-system, sans-serif
- Note: Preconnect hints should be in HTML <head>, not CSS

### Spacing & Radius

- 4px base unit (following 4/8/12/16 pattern from design spec)
- Radius: 8, 12, 16, 20, 24px scale (matches both apps)

### What Worked Well

1. Simple CSS import approach - no npm packages, no build changes
2. Legacy aliases prevent breaking existing components
3. Clear namespace prevents token collisions

### Potential Improvements for Wave 2

1. Consider CSS-in-JS token export for component libraries
2. Consider SCSS/CSS variables only import for smaller bundle
3. Flutter theme mapping could consume same token definitions