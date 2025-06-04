/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          text: '#e5e5e5',
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}