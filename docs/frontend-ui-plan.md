# Cafe-X Frontend UI/UX Plan

This document provides the UI/UX design strategy for all Cafe-X frontend applications: Landing Page, Admin Next.js, Customer Next.js, and Flutter POS. It covers design tokens, component inventory, layout patterns, accessibility, and multi-tenant branding.

## 1) Design System Tokens

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#2563EB` (Blue 600) | Main actions, links |
| `primary-hover` | `#1D4ED8` (Blue 700) | Hover states |
| `secondary` | `#64748B` (Slate 500) | Secondary text |
| `success` | `#10B981` (Emerald 500) | Success states |
| `warning` | `#F59E0B` (Amber 500) | Warnings |
| `error` | `#EF4444` (Red 500) | Errors |
| `background` | `#FFFFFF` | Page background |
| `surface` | `#F8FAFC` (Slate 50) | Cards, panels |
| `text-primary` | `#0F172A` (Slate 900) | Main text |
| `text-secondary` | `#475569` (Slate 600) | Secondary text |
| `border` | `#E2E8F0` (Slate 200) | Borders |

### Typography
| Token | Font | Size | Weight |
|-------|------|------|-------|
| `font-heading` | Inter | 24px/32px/40px | 600-700 |
| `font-body` | Inter | 14px/16px | 400 |
| `font-mono` | JetBrains Mono | 13px | 400 |

### Spacing
| Token | Value |
|-------|-------|
| `spacing-xs` | 4px |
| `spacing-sm` | 8px |
| `spacing-md` | 16px |
| `spacing-lg` | 24px |
| `spacing-xl` | 32px |
| `spacing-2xl` | 48px |

### Border Radius
| Token | Value |
|-------|-------|
| `radius-sm` | 4px |
| `radius-md` | 8px |
| `radius-lg` | 12px |
| `radius-full` | 9999px |

### Breakpoints
| Token | Width |
|-------|-------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |

## 2) Component Inventory

### Core Components
| Component | States | Description |
|-----------|--------|-------------|
| `Button` | default, hover, active, disabled, loading | Primary actions |
| `Input` | default, focus, error, disabled | Form input |
| `Select` | default, open, disabled | Dropdown |
| `Checkbox` | unchecked, checked, indeterminate | Multi-select |
| `Radio` | unselected, selected | Single-select |
| `Textarea` | default, focus, error | Multi-line input |
| `Card` | default, hover | Content container |
| `Modal` | open, closed | Dialog overlay |
| `Table` | default, loading, empty | Data grid |
| `Pagination` | default, active, disabled | Page navigation |
| `Badge` | success, warning, error, info | Status indicator |
| `Alert` | info, success, warning, error | Notifications |
| `Toast` | info, success, warning, error | Transient notifications |
| `Spinner` | default | Loading indicator |
| `DropdownMenu` | open, closed | Menu overlay |
| `Tabs` | default, active | Tab navigation |
| `Skeleton` | default | Loading placeholder |

### Domain Components
| Component | App | Description |
|-----------|-----|-------------|
| `ProductCard` | Customer, Admin | Product display |
| `ProductTable` | Admin | Product grid with filters |
| `OrderCard` | Customer, POS | Order summary |
| `OrderTable` | Admin | Order history |
| `Cart` | Customer | Shopping cart |
| `CheckoutForm` | Customer | Checkout flow |
| `DashboardCard` | Admin | KPI metrics |
| `Chart` | Admin | Data visualization |
| `ShiftPanel` | POS | Shift controls |
| `PaymentPanel` | POS | Payment options |
| `Receipt` | POS | Transaction receipt |

## 3) Layout Patterns

### Landing Page
- Hero section with CTA
- Feature grid (3-column)
- Pricing table
- Testimonials carousel
- Footer with links

### Admin Dashboard
- Sidebar navigation (fixed left)
- Top header with user menu
- Main content area (scrollable)
- Data tables with filters

### Customer Portal
- Header with nav
- Product grid (2-4 columns)
- Product detail page
- Cart drawer
- Checkout flow (multi-step)

### POS Screen
- Full-screen layout
- Product grid (left 70%)
- Order summary (right 30%)
- Quick action buttons
- Numeric keypad

## 4) Accessibility (WCAG 2.1 AA)

- Color contrast ≥ 4.5:1 for text
- Focus indicators visible
- Keyboard navigation for all interactions
- ARIA labels on icons/buttons
- Form error announcements
- Skip-to-content links
- Alt text for images

## 5) Multi-Tenant Branding

Tokens can be overridden per tenant:
```css
:root {
  --primary: var(--tenant-primary, #2563EB);
  --logo: var(--tenant-logo, /logo.png);
}
```

API response provides tenant config:
```json
{
  "tenant": {
    "primary_color": "#2563EB",
    "logo_url": "https://...",
    "name": "Cafe XYZ"
  }
}
```

## 6) Responsive Behavior

| App | Mobile | Tablet | Desktop |
|-----|--------|--------|--------|
| Landing | Stacked | 2-col | Full layout |
| Admin | Hidden sidebar | Collapsible | Fixed sidebar |
| Customer | Full width | 2-col grid | 4-col grid |
| POS | Portrait layout | Landscape opt | Landscape |

## 7) Acceptance Criteria

- [ ] Design tokens defined and documented
- [ ] Components implemented per inventory
- [ ] Layouts match patterns for each app
- [ ] Accessibility checks pass (WCAG AA)
- [ ] Multi-tenant branding supported
- [ ] Responsive design verified
- [ ] Consistent across all apps

This document will evolve as UI implementation progresses.