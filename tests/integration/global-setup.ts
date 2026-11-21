import { existsSync } from "node:fs";

/** Fails fast with a useful message instead of dozens of confusing "connection refused" errors. */
export default function globalSetup() {
  if (!existsSync(".test-dist/index.html")) {
    throw new Error('No test build found in .test-dist. Run "npm run build:test" first.');
  }
}
