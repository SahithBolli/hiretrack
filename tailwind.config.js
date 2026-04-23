/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#f0fdf9', 100:'#ccfbef', 500:'#14b8a6', 600:'#0d9488', 700:'#0f766e' },
        accent:  { 500:'#8b5cf6', 600:'#7c3aed' }
      }
    }
  },
  plugins: []
}
