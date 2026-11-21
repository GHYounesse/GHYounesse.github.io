// `npm run test:integration`: Playwright against the test build, tuned to stay easy on the machine.
//
//   npm run test:integration                         one browser at a time, below-normal priority
//   npm run test:integration -- --workers=2          more parallel browsers (faster, heavier)
//   npm run test:integration -- -g "contact"         anything else is passed straight to Playwright
import { run } from "./lib/run.mjs";

const args = process.argv.slice(2);
const index = args.findIndex((arg) => arg.startsWith("--workers="));
const workers = index < 0 ? undefined : args.splice(index, 1)[0].split("=")[1];

const { code } = await run(process.execPath, ["scripts/tool.mjs", "playwright", "test", ...args], {
  env: workers ? { PW_WORKERS: workers } : {},
  lowPriority: true,
});
process.exit(code);
