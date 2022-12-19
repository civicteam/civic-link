const path = require("path");

module.exports = {
  "parserOptions": {
    "project": "tsconfig.json",
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "react", "no-only-tests"],
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": "packages/*/tsconfig.json"
      }
    }
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "airbnb",
    "airbnb-typescript-prettier",
    "prettier"
  ],
  "root": true,
  "env": {
    "es2021": true,
    "node": true
  },
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
    "import/prefer-default-export": "off",
    "no-useless-constructor": "off",
    "no-only-tests/no-only-tests": "error"
  },
};
