// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  presets: [require("@civic/shared-tailwind")],
  content: [
    "dist/**/*.{js,html}",
    path.join(__dirname, "../react-commons/src/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "src/**/*.{js,jsx,ts,tsx}"),
  ],
};
