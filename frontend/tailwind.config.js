/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "rgb(208, 154, 189)",
          50: "#fbf7f9",
          100: "#f5eff3",
          200: "#eddfe7",
          500: "rgb(208, 154, 189)",
          600: "#b87c9f",
          700: "#9b6082",
        },
      },
    },
  },
  plugins: [],
};
