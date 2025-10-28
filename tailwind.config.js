import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        background: "#121212",
        onBackground: "#ffffff",
        primary: "#6200ee",
        onPrimary: "#ffffff",
        secondary: "#03dac6",
        onSecondary: "#000000",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

module.exports = config;
