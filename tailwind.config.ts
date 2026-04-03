import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        foreground: "#FAFAFA",
        card: { DEFAULT: "#18181B", foreground: "#FAFAFA" },
        primary: { DEFAULT: "#FAFAFA", foreground: "#09090B" },
        secondary: { DEFAULT: "#27272A", foreground: "#FAFAFA" },
        muted: { DEFAULT: "#27272A", foreground: "#A1A1AA" },
        accent: { DEFAULT: "#2563EB", foreground: "#FAFAFA" },
        destructive: { DEFAULT: "#EF4444", foreground: "#FAFAFA" },
        border: "#3F3F46",
        input: "#3F3F46",
        ring: "#2563EB",
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
