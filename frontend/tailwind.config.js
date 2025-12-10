/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  safelist: [
    // Button padding classes
    "px-3", "px-5", "px-6",
    "py-4",
    // Button text sizes
    "text-xs", "text-sm", "text-base",
    // Button icon sizes
    "w-4", "h-4", "w-5", "h-5",
    // Button gaps
    "gap-2.5",
  ],
  theme: {
    // Override default border radius values completely
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "8px",
      md: "8px",
      lg: "8px",
      xl: "12px",
      "2xl": "16px",
      "3xl": "24px",
      full: "9999px",
    },
    extend: {
      colors: {
        // eduBITES Brand Colors
        edubites: {
          primary: "#5845BA",
          "ongoing-content": "#9250FF",
          "accent-purple": "#9061F9",
          "quiz-solid": "#9F2CD4",
          "purple-text": "#AC94FA",
          highlighter: "#BE96FF",
          "scroll-arrows": "#B5ABE4",
          "card-stroke": "#D5D0EF",
          background: "#F5F7FD",
        },
        // Dark Mode Grays
        dark: {
          900: "#1D1D1D",
          800: "#2B2B2B",
          700: "#444444",
          600: "#575757",
          500: "#767676",
          400: "#A5A5A5",
          300: "#D6D6D6",
          200: "#E8E8E8",
          100: "#F5F5F5",
          50: "#FAFAFA",
        },
        // Figma Gray Scale (from design system)
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111928",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "edubites-sm":
          "0 1px 2px 0 rgba(88, 69, 186, 0.05)",
        edubites:
          "0 1px 3px 0 rgba(88, 69, 186, 0.1), 0 1px 2px 0 rgba(88, 69, 186, 0.06)",
        "edubites-md":
          "0 4px 6px -1px rgba(88, 69, 186, 0.1), 0 2px 4px -1px rgba(88, 69, 186, 0.06)",
        "edubites-lg":
          "0 10px 15px -3px rgba(88, 69, 186, 0.1), 0 4px 6px -2px rgba(88, 69, 186, 0.05)",
      },
    },
  },
  plugins: [],
};
