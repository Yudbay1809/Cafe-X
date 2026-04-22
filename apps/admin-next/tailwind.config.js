/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
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
        'sultan-primary': 'var(--sultan-primary)',
        'sultan-primary-dark': 'var(--sultan-primary-dark)',
        'sultan-cta': 'var(--sultan-cta)',
        'sultan-text': 'var(--sultan-text)',
        'sultan-text-muted': 'var(--sultan-text-muted)',
        'sultan-bg': 'var(--sultan-bg)',
        'sultan-surface': 'var(--sultan-surface)',
        'sultan-border': 'var(--sultan-border)',
        'sultan-success': 'var(--sultan-success)',
        'sultan-danger': 'var(--sultan-danger)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        'sultan': '0 8px 32px rgba(120, 53, 15, 0.1)',
        'sultan-lg': '0 20px 50px rgba(120, 53, 15, 0.15)',
      }
    },
  },
  plugins: [],
};
