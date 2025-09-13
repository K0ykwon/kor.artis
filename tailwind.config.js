/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#e74c3c',
          600: '#dc2626',
          700: '#b91c1c',
        },
        secondary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#2c3e50',
        }
      }
    },
  },
  plugins: [],
}
