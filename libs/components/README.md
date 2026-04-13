# Cafe-X Shared Components Library

A shared component library for Cafe-X Next.js applications using design tokens for consistent styling across apps.

## Structure

```
libs/
├── design-tokens/
│   └── tokens.css          # CSS custom properties (design tokens)
├── components/
│   ├── Button.tsx          # Button component
│   ├── Input.tsx           # Input component
│   ├── Card.tsx            # Card component (with Header, Content, Footer)
│   ├── Badge.tsx           # Badge/Pill component
│   ├── Navbar.tsx          # Navbar component (with NavbarLink)
│   └── index.ts            # Barrel exports
└── README.md               # This file
```

## Design Tokens

Import the design tokens in your app's global CSS:

```css
/* In your app/globals.css */
@import '../../libs/design-tokens/tokens.css';
/* or */
@tailwind base;
@layer base {
  @import '../../libs/design-tokens/tokens.css';
}
```

### Available Tokens

| Token | Description |
|-------|-------------|
| `--cx-bg` | Background color |
| `--cx-bg-alt` | Alternative background |
| `--cx-ink` | Primary text color |
| `--cx-muted` | Muted text color |
| `--cx-brand` | Primary brand color |
| `--cx-brand-2` | Secondary brand color |
| `--cx-card` | Card background |
| `--cx-border` | Border color |
| `--cx-success` | Success state color |
| `--cx-warning` | Warning state color |
| `--cx-danger` | Danger state color |
| `--cx-font-display` | Display font (Unbounded) |
| `--cx-font-body` | Body font (Manrope) |
| `--cx-space-*` | Spacing scale (1-8) |
| `--cx-radius-*` | Radius scale (sm, md, lg, xl) |
| `--cx-shadow-*` | Shadow values |
| `--cx-dur-*` | Duration values |

## Usage

### Button

```tsx
import { Button } from '../../libs/components';

<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary" size="sm">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive" isLoading>Delete</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'destructive' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)
- Plus standard button HTML props

### Input

```tsx
import { Input } from '../../libs/components';

<Input label="Email" type="email" placeholder="Enter email" />
<Input label="Password" type="password" error="Password is required" />
<Input label="Bio" helperText="Brief description" />
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- Plus standard input HTML props

### Card

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '../../libs/components';

<Card variant="default">
  <CardHeader><h2>Title</h2></CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

<Card variant="panel">Glass effect card</Card>
<Card variant="kpi">KPI display</Card>
```

**Props:**
- `variant`: 'default' | 'panel' | 'kpi' (default: 'default')

### Badge

```tsx
import { Badge } from '../../libs/components';

<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
```

**Props:**
- `variant`: 'neutral' | 'success' | 'warning' | 'danger' (default: 'neutral')

### Navbar

```tsx
import { Navbar, NavbarLink } from '../../libs/components';

<Navbar brand="Cafe-X" actions={<Button>Login</Button>}>
  <NavbarLink href="/menu">Menu</NavbarLink>
  <NavbarLink href="/about">About</NavbarLink>
</Navbar>
```

**Props:**
- `brand`: string (default: 'Cafe-X')
- `logo`: ReactNode
- `actions`: ReactNode

## Integration

### Using Path Alias (Recommended)

Add to your app's `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@libs/*": ["../../libs/*"]
    }
  }
}
```

### In Next.js App

1. Import design tokens in your app's global CSS:
```css
/* In your app/globals.css */
@import '../../libs/design-tokens/design-tokens.css';
```

2. Use components with path alias:
```tsx
import { Button, Card, Input, CardContent } from '@libs/components';

export default function Page() {
  return (
    <div className="p-8">
      <Card>
        <CardContent>
          <Input label="Name" placeholder="Your name" />
          <Button className="mt-4">Submit</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Notes

- Components use Tailwind utility classes + design tokens via `var(--cx-*)`
- All components are forwardRef enabled for flexibility
- Components include accessibility attributes (aria-invalid, aria-describedby)
- Components are typed with TypeScript interfaces

### Skeleton

```tsx
import { Skeleton, SkeletonButton, SkeletonInput, SkeletonCard, SkeletonList } from '../../libs/components';
import '../../libs/components/skeleton.css';

// Loading state for button
<SkeletonButton isLoading />

// Loading state for input
<SkeletonInput isLoading />

// Loading card placeholder
<SkeletonCard isLoading />

// List loading
<SkeletonList>
  <Skeleton variant="text" />
  <Skeleton variant="text" />
  <Skeleton variant="text" />
</SkeletonList>
```

**Variants:**
- `variant`: 'text' | 'avatar' | 'button' | 'input' | 'card' | 'badge' | 'title' | 'paragraph' (default: 'text')

**Props:**
- `width`, `height`: Custom dimensions
- `isLoading`: Show/hide skeleton (for component wrappers)

**CSS Classes:**
- `.skeleton` - Base skeleton pulse animation
- `.skeleton-list` - Skeleton list layout
- `.skeleton-card-grid` - Grid layout for cards