const Environment = require("jest-environment-jsdom");
const { mergeAll } = require("ramda");

module.exports = class CustomTestEnvironment extends Environment {
  constructor(config) {
    super(
      mergeAll([
        config,
        {
          globals: mergeAll([
            config.globals,
            {
              Uint8Array,
              ArrayBuffer,
            },
          ]),
        },
      ])
    );
  }

  async setup() {
    await super.setup();
    if (typeof this.global.TextEncoder === "undefined") {
      const { TextEncoder, TextDecoder } = require("util");
      this.global.TextEncoder = TextEncoder;
      this.global.TextDecoder = TextDecoder;
    }
  }
};

process.env = Object.assign(process.env, {
  REACT_APP_STAGE: "prod",
  REACT_APP_ENABLE_ANALYTICS: false,
});
