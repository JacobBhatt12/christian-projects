import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  use: { baseURL: "http://localhost:5173", ...devices["Desktop Chrome"] },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  reporter: "list",
});
