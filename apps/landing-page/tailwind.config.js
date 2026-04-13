/** @type {import('tailwindcss').Config} */
// Tailwind v3 config with design tokens (Wave 1-3)
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,css}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'sans-serif'],
      },
      colors: {
        // Design tokens (from CSS vars)
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
      },
      borderRadius: {
        sm: 'var(--cx-radius-sm)',
        md: 'var(--cx-radius-md)',
        lg: 'var(--cx-radius-lg)',
        xl: 'var(--cx-radius-xl)',
      },
    },
  },
  plugins: [],
};