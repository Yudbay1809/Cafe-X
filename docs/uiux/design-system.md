# Cafe-X Design System (v1)

Applies to:
- Web: `apps/admin-next`, `apps/customer-next` (CSS variables)
- POS: `apps/pos-flutter` (Flutter theme)

## Brand tokens (web)
All tokens are prefixed with `--cx-` and set in:
- `apps/admin-next/app/globals.css`
- `apps/customer-next/app/globals.css`

### Color
- `--cx-bg`, `--cx-bg-alt`
- `--cx-surface`
- `--cx-text`, `--cx-text-muted`
- `--cx-border`
- `--cx-brand`, `--cx-brand-2`
- `--cx-success`, `--cx-warning`, `--cx-danger`

### Radius
- `--cx-radius-sm`, `--cx-radius-md`, `--cx-radius-lg`, `--cx-radius-xl`

### Shadow
- `--cx-shadow-sm`, `--cx-shadow-md`, `--cx-shadow-lg`

### Motion
- `--cx-ease-out`, `--cx-ease-in`
- `--cx-dur-1` (120ms), `--cx-dur-2` (180ms), `--cx-dur-3` (220ms)
- Web must respect `prefers-reduced-motion: reduce` (already enforced in both globals).

## Typography
- Web body: **Manrope**
- Web headings: **Unbounded**
- POS (Flutter): body **Manrope**, display/headings **Space Grotesk** via `AppTypography` (`apps/pos-flutter/lib/core/theme/typography.dart`).

## Interaction rules (v1)
- **Primary CTA**: single clear action per screen (ex: “Checkout”, “Place order”, “Pay”).
- **Loading**: use skeleton/shimmer for lists; avoid full-page spinners.
- **Errors**: 1-line summary + “try again” CTA; keep technical details hidden.
- **Status**: use color + icon + text (never color-only).

