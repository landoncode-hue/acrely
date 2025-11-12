/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        4: "4px",
        8: "8px",
        16: "16px",
        24: "24px",
        40: "40px",
      },
      borderRadius: {
        "2xl": "1rem",
      },
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(224 71.4% 4.1%)",
        primary: {
          50: "#fef2ee",
          100: "#fde5dc",
          200: "#fbcbb9",
          300: "#f8b096",
          400: "#f69673",
          500: "#D54A1D", // Acrely Primary Orange-Red
          600: "#aa3b17",
          700: "#802c11",
          800: "#551e0c",
          900: "#2b0f06",
          950: "#150703",
        },
        accent: {
          50: "#fff5ed",
          100: "#ffebdb",
          200: "#ffd7b7",
          300: "#ffc293",
          400: "#ffae6f",
          500: "#FF9B45", // Acrely Accent Light Orange/Peach
          600: "#cc7c37",
          700: "#995d29",
          800: "#663e1c",
          900: "#331f0e",
          950: "#1a0f07",
        },
      },
    },
  },
  plugins: [],
};
