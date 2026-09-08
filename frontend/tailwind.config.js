/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF4EC",
          100: "#FFE4CF",
          200: "#FFC79C",
          300: "#FFA35F",
          400: "#FB7B2E",
          500: "#E85D0A", // primary
          600: "#C24705",
          700: "#983806",
          800: "#7A2E08",
          900: "#4A1B04",
        },
        ink: {
          900: "#1B1B18",
          700: "#3A3A35",
          500: "#6B6B63",
          300: "#B4B3A8",
          100: "#EDECE4",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};
