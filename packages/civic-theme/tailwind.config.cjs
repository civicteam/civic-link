// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@civic/shared-tailwind")],
  content: [
    "dist/**/*.{js,html}",
    path.join(__dirname, "src/**/*.{js,jsx,ts,tsx}"),
  ],
  // theme: {
  //   extend: {},
  // },
  // plugins: [],
};
