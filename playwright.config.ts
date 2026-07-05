import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  // 編成は1駒ずつ保存(repository)+useLiveQuery再描画のため、シナリオ全体で~30sかかる。既定30sだと超過するので余裕を持たせる。
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
