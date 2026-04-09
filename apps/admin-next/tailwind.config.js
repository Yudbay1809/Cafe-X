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
        sans: ['Space Mono', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        neu: {
          surface: '#E7E5E4',
          text: '#1E2938',
          primary: '#006666',
          secondary: '#F1F2F5',
          success: '#00A63D',
          warning: '#FE9900',
          danger: '#FF2157',
        }
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
