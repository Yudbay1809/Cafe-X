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
        'sultan-primary': '#78350F',
        'sultan-primary-dark': '#451A03',
        'sultan-cta': '#FBBF24',
        'sultan-bg-warm': '#FEF3C7',
        'sultan-surface': '#FFFFFF',
        'sultan-border': '#FDE68A',
        'sultan-text': '#451A03',
        'sultan-text-muted': '#92400E',
      },
      spacing: {
        '10': '2.5rem', // 40px
        '8': '2rem',    // 32px
        '5': '1.25rem', // 20px
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
      },
      boxShadow: {
        'sultan-soft': '0 2px 12px 0 rgba(120, 53, 15, 0.05)',
        'sultan-active': '0 8px 24px 0 rgba(120, 53, 15, 0.15)',
        'sultan-gold': '0 8px 28px 0 rgba(251, 191, 36, 0.3)',
      }
    },
  },
  plugins: [],
};
