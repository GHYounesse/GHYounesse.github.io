// `npm run verify`: the whole local feedback loop in one command, with a summary at the end.
//
//   npm run verify                    everything (lint, types, unit, build, html, integration, perf, security)
//   npm run verify:fast               lint + types + unit tests only (seconds; this is what pre-push runs)
//   npm run verify -- --only=unit,security           / --skip=perf / --bail (stop at the first failure)
//
// The browser stages (build, Playwright, Lighthouse) run below normal OS priority so the machine stays usable.
import { run } from "./lib/run.mjs";

const stages = [
  { id: "lint", name: "Lint + format", cmd: ["run", "lint"], fast: true },
  { id: "types", name: "Type check", cmd: ["run", "typecheck"], fast: true },
  { id: "unit", name: "Unit tests", cmd: ["run", "test"], fast: true },
  { id: "build", name: "Test build", cmd: ["run", "build:test"], heavy: true },
  { id: "html", name: "HTML validation", cmd: ["run", "lint:html"], needsBuild: true },
  {
    id: "integration",
    name: "Integration (Playwright)",
    cmd: ["run", "test:integration"],
    needsBuild: true,
    heavy: true,
  },
  { id: "perf", name: "Performance", cmd: ["run", "test:perf"], needsBuild: true, heavy: true },
  { id: "security", name: "Security", cmd: ["run", "test:security"], needsBuild: true },
];

const list = (prefix) =>
  process.argv
    .find((a) => a.startsWith(prefix))
    ?.slice(prefix.length)
    .split(",");
const only = list("--only=");
const skip = list("--skip=") ?? [];
const fast = process.argv.includes("--fast");
const bail = process.argv.includes("--bail");

const selected = stages.filter(
  (s) => (fast ? s.fast : true) && (only ? only.includes(s.id) : true) && !skip.includes(s.id),
);
// Anything that reads the test build needs the build stage (unless one was already made).
if (only && selected.some((s) => s.needsBuild) && !selected.some((s) => s.id === "build")) {
  console.log("note: stages that read the build expect `npm run build:test` to have been run already.");
}

const results = [];
let buildFailed = false;

for (const stage of selected) {
  if (stage.needsBuild && buildFailed) {
    results.push({ ...stage, status: "skipped", seconds: 0 });
    continue;
  }
  console.log(`\n━━━ ${stage.name} ${"━".repeat(Math.max(0, 60 - stage.name.length))}`);
  const started = Date.now();
  const { code } = await run("npm", stage.cmd, { lowPriority: stage.heavy });
  const seconds = (Date.now() - started) / 1000;
  results.push({ ...stage, status: code === 0 ? "pass" : "FAIL", seconds });
  if (stage.id === "build" && code !== 0) buildFailed = true;
  if (code !== 0 && bail) break;
}

console.log("\n━━━ Summary " + "━".repeat(50));
const icon = { pass: "✔", FAIL: "✘", skipped: "–" };
for (const r of results) {
  console.log(
    ` ${icon[r.status]} ${r.name.padEnd(30)} ${r.status.padEnd(8)} ${r.seconds ? r.seconds.toFixed(1) + "s" : ""}`,
  );
}
const failed = results.filter((r) => r.status === "FAIL");
const total = results.reduce((sum, r) => sum + r.seconds, 0);
console.log(
  `\n${failed.length ? `✘ ${failed.length} stage(s) failed` : "✔ all stages passed"}  (${total.toFixed(0)}s)`,
);
process.exit(failed.length ? 1 : 0);
