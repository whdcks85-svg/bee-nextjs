import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: "#D85A30",
        teal: "#0F6E56",
        bee: {
          bg: "#F7F6F3",
          border: "#ece9e4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
