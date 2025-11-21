/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        loyal: '#2563eb',
        infiltrated: '#dc2626',
        accent: '#14b8a6',
      },
    },
  },
  plugins: [],
};
