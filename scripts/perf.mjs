// `npm run test:perf`: bundle/image budgets, then Lighthouse.
//   node scripts/perf.mjs            budgets + Lighthouse
//   node scripts/perf.mjs --budgets  budgets only (fast, light)
//   LH_TIMEOUT=600 node scripts/perf.mjs   seconds allowed for Lighthouse before it is killed (default 300)
import { run } from "./lib/run.mjs";

const budgetsOnly = process.argv.includes("--budgets");
const results = [];

console.log("\n── bundle and image budgets");
results.push([
  "budgets",
  (await run(process.execPath, ["scripts/tool.mjs", "vitest", "run", "--project", "perf"])).code === 0,
]);

if (!budgetsOnly) {
  const timeoutMs = (Number(process.env.LH_TIMEOUT) || 300) * 1000;
  console.log(`\n── Lighthouse (stops after ${timeoutMs / 1000}s if it hangs)`);
  // Normal priority on purpose: it is a single Chrome, and starving it makes Lighthouse's timing waits worse.
  const { code, timedOut } = await run(
    process.execPath,
    ["scripts/tool.mjs", "lhci", "autorun", "--config=.lighthouserc.cjs"],
    { timeoutMs },
  );
  if (timedOut) console.error(`   ✘ Lighthouse was stopped after ${timeoutMs / 1000}s without finishing.`);
  results.push(["lighthouse", code === 0]);
}

const failed = results.filter(([, ok]) => !ok);
console.log(`\nPerformance: ${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
