/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/*.html"],
  theme: {
    extend: {
      boxShadow: {
        wnote: "inset 0px -2px 0px 2px rgba(0, 0, 0, 0.25)",
        bnote: "inset 0px -3px 0px 3px rgba(255, 255, 255, 0.15)",
      },
    },
  },
  plugins: [],
};
