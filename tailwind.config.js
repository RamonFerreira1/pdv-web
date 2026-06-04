/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}", // include root files if they remain here
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a', // Slate 900
        darkCard: '#1e293b', // Slate 800
        darkBorder: '#334155', // Slate 700
        primaryGreen: '#10b981', // Emerald 500
        primaryHover: '#059669', // Emerald 600
      },
    },
  },
  plugins: [],
}
