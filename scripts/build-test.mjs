// Builds the site into .test-dist, pointed at the local mock Formspree service, for the browser, performance and
// security checks. (`npm run build` makes the real, production build in dist/.)
import { rm } from "node:fs/promises";
import { astroBin, run } from "./lib/run.mjs";
import { root } from "./lib/cwd.mjs";

export const MOCK_ENDPOINT = "http://127.0.0.1:4010/f/test";

await rm(`${root}/.test-dist`, { recursive: true, force: true });

const started = Date.now();
const { code, output } = await run(process.execPath, [astroBin, "build", "--outDir", ".test-dist"], {
  env: { PUBLIC_FORM_ENDPOINT: MOCK_ENDPOINT },
  quiet: true,
});
const seconds = ((Date.now() - started) / 1000).toFixed(1);

if (code === 0) {
  console.log(`  ✔ test build ready in ${seconds}s  (.test-dist)`);
} else {
  console.error(`  ✘ test build failed\n${output}`);
}
process.exit(code);
