const path = require("path");

module.exports = {
  rules: {
    "react/react-in-jsx-scope": "off",
    "class-methods-use-this": "off",
    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        required: {
          some: ["nesting", "id"],
        },
      },
    ],
    "jsx-a11y/label-has-for": [
      "error",
      {
        required: {
          some: ["nesting", "id"],
        },
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          path.join(__dirname, "test/**/*.{ts,tsx}"),
          path.join(__dirname, "**/*.spec.ts"),
          path.join(__dirname, "**/*.e2e-spec.ts"),
        ],
      },
    ],
  },
};
