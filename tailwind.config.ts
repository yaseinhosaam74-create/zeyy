import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "hero-red":    "#38040E",
        "abiya-white": "#E8DCCA",
        "deep-teal":   "#305252",
        "midnight":    "#1A2238",
        "pure-black":  "#000000",
      },
      fontFamily: {
        ruqaa:     ["Aref Ruqaa", "serif"],
        cormorant: ["Cormorant Garamond", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
