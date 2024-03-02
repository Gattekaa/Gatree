import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        backgroundImage: "url('../public/jpg/backgroundImage.jpg')",
        stars: "url('../public/webp/stars.webp')",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        floatDown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(150%)" },
        },
        floatUp: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-150%)" },
        },
        floatLeft: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-150%)" },
        },
        floatRight: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(150%)" },
        },
        pop: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        floatDown: "floatDown 10s ease-in-out infinite",
        floatUp: "floatUp 10s ease-in-out infinite",
        floatLeft: "floatLeft 10s ease-in-out infinite",
        floatRight: "floatRight 10s ease-in-out infinite",
        pop: "pop 0.05s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
