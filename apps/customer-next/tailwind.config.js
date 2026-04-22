/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,css}',
    './components/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'playfair-display-sc': ['var(--font-playfair)', 'serif'],
        'karla': ['var(--font-karla)', 'sans-serif'],
      },
      colors: {
        'sultan-bg': 'var(--sultan-bg)',
        'sultan-surface': 'var(--sultan-surface)',
        'sultan-surface-2': 'var(--sultan-surface-2)',
        'sultan-primary': 'var(--sultan-primary)',
        'sultan-cta': 'var(--sultan-cta)',
        'sultan-text': 'var(--sultan-text)',
        'sultan-text-muted': 'var(--sultan-text-muted)',
        'sultan-border': 'var(--sultan-border)',
        'sultan-success': 'var(--sultan-success)',
        'sultan-danger': 'var(--sultan-danger)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.2)',
      }
    },
  },
  plugins: [],
};