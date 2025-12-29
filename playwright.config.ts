import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const { CI } = process.env;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Safari",
      use: { ...devices["Desktop Safari"] },
    },

    {
      name: "iPhone",
      use: { ...devices["iPhone SE (3rd gen)"] },
    },
    {
      name: "Pixel",
      use: { ...devices["Pixel 7"] },
    },
  ],

  webServer: {
    command: "npm run preview",
    url: "http://localhost:5173",
    reuseExistingServer: !CI,
    timeout: 120000,
  },
});
