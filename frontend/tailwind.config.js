/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2A4A",
        paper: "#FAF7F0",
        brass: "#B08D57",
        slate: "#6B6E76",
        rule: "#D8D2C4",
        moss: "#3F6B4F",
        rust: "#A83C3C",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        laid: "repeating-linear-gradient(0deg, rgba(27,42,74,0.025) 0px, rgba(27,42,74,0.025) 1px, transparent 1px, transparent 28px)",
      },
    },
  },
  plugins: [],
};