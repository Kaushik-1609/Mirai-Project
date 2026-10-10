/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./js/**/*.js"
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        msot: {
          dark: '#070811',
          card: '#0c0d18',
          cyan: '#00f0ff',
          gold: '#ffd700',
          purple: '#a855f7'
        }
      }
    },
  },
  plugins: [],
};
