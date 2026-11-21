import { defineConfig, devices } from "@playwright/test";

/** The test build (scripts/build-test.mjs) is served on this port, next to the mock Formspree service. */
export const SITE_PORT = 4101;
export const MOCK_URL = "http://127.0.0.1:4010";

const ci = Boolean(process.env.CI);

// Browser tests are the heavy part of the loop. Defaults keep a laptop usable:
//   PW_WORKERS=2   parallel browsers (default 1: headless Chrome has no GPU, so the WebGL hero runs on the CPU)
//   PW_MOTION=1    run every test with animations on (default: off, see below)
// `npm run test:integration -- --workers=2` sets the first for you.

// Fewer background processes per Chrome instance; software GL because headless Chrome has no GPU.
const CHROME_ARGS = [
  "--disable-extensions",
  "--disable-background-networking",
  "--no-first-run",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
];

export default defineConfig({
  testDir: "tests/integration",
  globalSetup: "./tests/integration/global-setup.ts",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  workers: Number(process.env.PW_WORKERS) || 1,
  reporter: [["list"], ["html", { open: "never" }]],
  retries: ci ? 1 : 0,
  use: {
    // Tracing every test is slow; it is recorded on the retry (CI) and can be forced with `--trace on` locally.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Without a GPU every animated frame (WebGL shader, blurred nav, grain overlay, marquee) is painted by the CPU
    // and never stops. Tests run with reduced motion, which the site supports: the shader draws one still frame
    // and the continuous animations stop. tests/integration/motion.spec.ts opts back in for the animated paths.
    reducedMotion: process.env.PW_MOTION ? "no-preference" : "reduce",
    // Locally, drive the Chrome you already have so no browser download is needed. CI installs Chromium.
    ...(ci ? {} : { channel: "chrome" }),
  },
  projects: [
    {
      name: "site",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: `http://127.0.0.1:${SITE_PORT}`,
        launchOptions: { args: CHROME_ARGS },
      },
    },
  ],
  webServer: [
    {
      command: `node mocks/static-server.mjs .test-dist ${SITE_PORT}`,
      url: `http://127.0.0.1:${SITE_PORT}/`,
      reuseExistingServer: !ci,
    },
    { command: "node mocks/formspree-server.mjs", url: `${MOCK_URL}/health`, reuseExistingServer: !ci },
  ],
});
