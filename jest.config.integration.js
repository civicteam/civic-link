/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
module.exports = {
  preset: "ts-jest",
  clearMocks: true,
  collectCoverage: false,
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
      tsConfig: "tsconfig.test.integration.json",
    },
  },
  setupFiles: ["jest-localstorage-mock"],
};
