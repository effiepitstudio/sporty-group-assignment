/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,ts,tsx}"],
  theme: {
    extend: {
      // Colors from SportyBet
      colors: {
        primary: "#E41827",
        secondary: "#0D9737",
        dark: "#1B1E25",
        light: "#ffffff",
      },
      fontFamily: {
        sans: ["Ubuntu", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
