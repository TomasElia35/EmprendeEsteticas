/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FDFAF7',
          100: '#F5EAE0',
          200: '#EAD5C4',
          300: '#D4B89E',
          400: '#BE9B78',
          500: '#A87E5C',
          600: '#8C6848',
          700: '#705138',
          800: '#543C29',
          900: '#38271A',
        },
        secondary: '#1C1007',
        accent:    '#B8714F',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(28,16,7,0.06), 0 1px 2px -1px rgba(28,16,7,0.04)',
        'card-md': '0 4px 6px -1px rgba(28,16,7,0.07), 0 2px 4px -2px rgba(28,16,7,0.05)',
        'modal': '0 20px 40px -8px rgba(28,16,7,0.18), 0 8px 16px -4px rgba(28,16,7,0.10)',
      },
    },
  },
  plugins: [],
}
