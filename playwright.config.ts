import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // D-010: Chromium + WebKit in MVP. Firefox stays a manual/later check.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      // V8 -- WEBKIT GETS A LONGER BUDGET, AND ONLY A BUDGET.
      //
      // Several spatial tests wait for the camera to ARRIVE after a scripted
      // scroll, and arrival is governed: the route governor spends a bounded
      // per-frame budget (V7), so how long a jump takes in wall-clock is a
      // function of the frame rate the engine is actually achieving. Measured on
      // this machine against the same build and the same 3000px jump:
      //
      //   chromium   45 fps   settles in  5.3s
      //   webkit     14 fps   settles in 10.0s
      //
      // WebKit has no GPU process here and renders in software, so it runs at
      // roughly a third of Chromium's frame rate and every governed wait costs
      // about twice as long. The camera does arrive -- it is the same code, and
      // the assertions that follow the wait pass once it has -- so the failures
      // this produced were the 30s default expiring mid-journey, not a broken
      // contract. Not one assertion or threshold is relaxed to accommodate it.
      timeout: 120_000,
    },
  ],
  webServer: {
    command: `pnpm exec next build && pnpm exec next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
