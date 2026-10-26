const { defineConfig } = require("@playwright/test");
const path = require("node:path");

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "site.spec.js",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: process.env.SITE_URL || "http://127.0.0.1:4001",
    channel: process.env.CI ? undefined : "chrome",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: process.env.SITE_URL
    ? undefined
    : {
        command: "python3 -m http.server 4001 --bind 127.0.0.1 --directory _site",
        cwd: path.resolve(__dirname, "../.."),
        url: "http://127.0.0.1:4001",
        reuseExistingServer: !process.env.CI,
      },
});
