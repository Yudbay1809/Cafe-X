# Cafe-X Design System (UI/UX Max)

Tanggal: 2026-04-08
Scope: Next.js (CSS vars/Tailwind) + Flutter Theme

## 1) Core Tokens
### Color Tokens (CSS vars)
```
:root {
  --bg: #f6efe7;
  --bg-alt: #efe4d8;
  --ink: #1b140f;
  --muted: #6e6158;
  --brand: #0f6b63;
  --brand-2: #d07a3a;
  --card: #ffffff;
  --border: #e7e1d9;
  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #dc2626;
  --ring: rgba(15, 107, 99, 0.25);
  --shadow: 0 20px 50px rgba(20, 12, 6, 0.14);
}
```

### Typography
- Display: **Unbounded**
- Body/UI: **Manrope**

### Spacing & Radius
- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32
- Radius: 12 (input), 16 (card), 20–26 (hero)

### Shadow
- Card/Panel: `0 18px 40px rgba(15,23,42,0.10–0.16)`
- Hero emphasis: `0 20px 50px rgba(15,23,42,0.20)`

## 2) Component Variants
### Buttons
- Primary: gradient brand
- Secondary: gradient brand-2
- Ghost: white bg + border
- Destructive: solid danger

### Badges / Pills
- Neutral: light gray
- Success: green tint
- Warning: orange tint
- Danger: red tint

### Cards
- Default: `card + shadow`
- Panel: `glass + blur`
- KPI: bold number + small caption

### Inputs
- Rounded 12px, light background, ring on focus

## 3) Motion Rules
- Hover: translateY(-1px) + soft shadow
- Press: scale(0.98)
- Loading: shimmer 2.2s loop
- Success: pulse once (0.35s)
- Duration: 150–300ms (UI), 600–1200ms (transition)

## 4) Next.js Implementation
### CSS Vars (global)
- `app/globals.css` define tokens
- Buttons and cards refer tokens

### Tailwind Use
- Wrap custom classes (`card`, `btn`, `pill`) as global classes

## 5) Flutter Theme Mapping
```
AppColors.brandPrimary = #0F6B63
AppColors.brandSecondary = #D07A3A
AppColors.surface = #F6EFE7
AppColors.surfaceSoft = #EFE4D8
AppColors.textPrimary = #1B140F
AppColors.textMuted = #6E6158
AppColors.outline = #E7E1D9
```

- Buttons: gradient primary / secondary
- Cards: radius 16, border outline
- AppBar: brandPrimary + white text

## 6) Usage Guidelines
- Hero hanya 1 per halaman (Menu, Cart, Status)
- CTA utama maksimal 1 per view
- Secondary CTA tampil sebagai outline/ghost

