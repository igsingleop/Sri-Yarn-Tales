/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          DEFAULT: "#D4768A",
          dark: "#B85C71",
          light: "#FBE9ED",
          50: "#fef2f4",
          100: "#fde6eb",
          200: "#fbd0da",
          300: "#f7aab8",
          400: "#f07a90",
          500: "#D4768A",
          600: "#B85C71",
          700: "#9a4459",
          800: "#7d3548",
          900: "#6a2d3d",
        },
        // Accent palette
        sage: {
          DEFAULT: "#8FA98B",
          light: "#C8DEC5",
          dark: "#6B8A67",
        },
        butter: {
          DEFAULT: "#F4D58D",
          light: "#FAF0CC",
          dark: "#D4B05A",
        },
        // Text
        cocoa: {
          DEFAULT: "#3B2A2F",
          light: "#5C4449",
        },
        warmgray: {
          DEFAULT: "#7A6A6D",
          light: "#A89FA1",
        },
        // Backgrounds
        oatmeal: {
          DEFAULT: "#F6EFE7",
          dark: "#EDE5DA",
        },
        cream: {
          DEFAULT: "#FFFAF5",
          dark: "#F5EEE6",
        },
        // Borders
        border: {
          DEFAULT: "#EADFD6",
          dark: "#D9CCBF",
        },
        // States
        error: "#C8553D",
        success: "#8FA98B",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
        body: ["Poppins", "sans-serif"],
        accent: ["Caveat", "cursive"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1.125rem" }],
        sm: ["0.875rem", { lineHeight: "1.375rem" }],
        base: ["1rem", { lineHeight: "1.625rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.375rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.625rem" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.05" }],
        "fluid-sm": "clamp(0.875rem, 1.5vw, 1rem)",
        "fluid-base": "clamp(1rem, 1.8vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 2vw, 1.375rem)",
        "fluid-xl": "clamp(1.25rem, 2.5vw, 1.75rem)",
        "fluid-2xl": "clamp(1.5rem, 3vw, 2.25rem)",
        "fluid-3xl": "clamp(1.875rem, 4vw, 3rem)",
        "fluid-4xl": "clamp(2.25rem, 5vw, 4rem)",
        "fluid-hero": "clamp(2.5rem, 6vw, 5.5rem)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        88: "22rem",
        128: "32rem",
      },
      boxShadow: {
        rose: "0 4px 24px -4px rgba(212, 118, 138, 0.25)",
        "rose-lg": "0 8px 40px -8px rgba(212, 118, 138, 0.35)",
        card: "0 2px 16px rgba(59, 42, 47, 0.08)",
        "card-hover": "0 8px 32px rgba(59, 42, 47, 0.14)",
        warm: "0 4px 24px rgba(212, 118, 138, 0.15), 0 1px 4px rgba(59, 42, 47, 0.06)",
        inner: "inset 0 2px 8px rgba(59, 42, 47, 0.06)",
      },
      backgroundImage: {
        "gradient-hero":
          "linear-gradient(135deg, #FBE9ED 0%, #FFFAF5 40%, #F6EFE7 100%)",
        "gradient-section":
          "linear-gradient(180deg, #FFFAF5 0%, #F6EFE7 100%)",
        "gradient-rose":
          "linear-gradient(135deg, #FBE9ED 0%, #F9D0D9 50%, #D4768A 100%)",
        "gradient-card":
          "linear-gradient(145deg, rgba(255,250,245,0.9) 0%, rgba(246,239,231,0.7) 100%)",
      },
      animation: {
        "blob-slow": "blob 8s ease-in-out infinite",
        "blob-medium": "blob 6s ease-in-out infinite 2s",
        "blob-fast": "blob 5s ease-in-out infinite 4s",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        marquee: "marquee 30s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        400: "400ms",
      },
    },
  },
  plugins: [],
};
