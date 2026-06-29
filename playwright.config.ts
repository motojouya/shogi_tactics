import { defineConfig, devices } from "@playwright/test";

// 統合テスト(E2E)はtest/配下の*.spec.tsに置く。viteのdev server(port 3000)を自動起動して実行する。
// データはIndexedDB(Dexie)に保存されるため、シナリオ間で状態を共有する必要があるものは
// 1つのtest内のtest.step、もしくはdescribe.serialで順序を保証する。
export default defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
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
