/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
module.exports = {
  preset: "ts-jest",
  clearMocks: true,
  collectCoverage: true,
  silent: false,
  verbose: false,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.ts"],
  modulePathIgnorePatterns: [
    "<rootDir>/cypress",
    "<rootDir>/src/components", // Ignoring visual components
    "<rootDir>/src/pages", // Ignoring visual components
  ],
  moduleNameMapper: {
    "\\.svg": "<rootDir>/test/fixtures/fileMock.ts",
  },
  globals: {
    Uint8Array,
    "ts-jest": {
      tsconfig: "tsconfig.test.unit.json",
    },
  },
  coverageThreshold: {
    // TODO CM-1722 re-raise these to (at-least) previous values: 80.07 |    66.66 |      72 |   78.45
    global: {
      statements: 88,
      branches: 77,
      functions: 78,
      lines: 88,
    },
  },
  setupFiles: ["jest-localstorage-mock"],
  testEnvironment: "./test/custom-env.cjs",
};
