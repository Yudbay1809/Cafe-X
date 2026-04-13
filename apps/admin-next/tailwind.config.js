/** @type {import('tailwindcss').Config} */
// Tailwind config aligned with design-token-based theming (Wave 3)
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Mono', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Design tokens (from CSS vars - Wave 1-3)
        brand: 'var(--cx-brand)',
        'brand-deep': 'var(--cx-brand-deep)',
        'brand-light': 'var(--cx-brand-light)',
        teal: 'var(--cx-teal)',
        'teal-light': 'var(--cx-teal-light)',
        bg: 'var(--cx-bg)',
        surface: 'var(--cx-surface)',
        'surface-2': 'var(--cx-surface-2)',
        text: 'var(--cx-text)',
        muted: 'var(--cx-muted)',
        subtle: 'var(--cx-subtle)',
        // Status colors
        success: 'var(--cx-success)',
        warning: 'var(--cx-warning)',
        danger: 'var(--cx-danger)',
        // Legacy/Neu colors (admin-specific)
        neu: {
          surface: '#E7E5E4',
          text: '#1E2938',
          primary: '#006666',
          secondary: '#F1F2F5',
          success: '#00A63D',
          warning: '#FE9900',
          danger: '#FF2157',
        },
      },
      boxShadow: {
        'neu': '8px 8px 16px #c4c2c1, -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 8px #c4c2c1, -4px -4px 8px #ffffff',
        'neu-hover': '12px 12px 20px #c4c2c1, -12px -12px 20px #ffffff',
        'neu-inset': 'inset 6px 6px 12px #c4c2c1, inset -6px -6px 12px #ffffff',
      }
    },
  },
  plugins: [],
};
