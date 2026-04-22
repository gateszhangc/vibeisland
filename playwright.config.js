const { defineConfig } = require("@playwright/test");

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4174";
const useLocalWebServer = !process.env.PLAYWRIGHT_BASE_URL;

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  webServer: useLocalWebServer
    ? {
        command: "PORT=4174 node server.js",
        url: "http://127.0.0.1:4174",
        reuseExistingServer: false,
        timeout: 120_000
      }
    : undefined
});
