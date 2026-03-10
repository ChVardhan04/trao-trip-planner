/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["'Trebuchet MS'", "sans-serif"],
      },
      colors: {
        sand: {
          50: "#fdf8f0",
          100: "#f5ead6",
          200: "#e8d0a9",
          300: "#d4a96a",
          400: "#c4883e",
          500: "#b06c28",
          600: "#8f5220",
        },
        ocean: {
          400: "#3b82f6",
          500: "#2563eb",
          600: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
