/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      gridAutoRows: {
        fr: "1fr",
      },
    },
  },
  plugins: [],
};
