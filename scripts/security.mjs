// `npm run test:security`: dependency audit + secret scan + the checks on the built sites and the repo.
// Every step runs even if an earlier one fails, so one report shows everything that needs attention.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { run } from "./lib/run.mjs";
import { root } from "./lib/cwd.mjs";

const results = [];
const step = async (name, task) => {
  console.log(`\n── ${name}`);
  const code = await task();
  results.push([name, code === 0]);
};

await step("npm audit (high and critical)", async () => (await run("npm", ["audit", "--audit-level=high"])).code);

await step("secret scan (tracked and not-yet-committed files)", async () => {
  const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter((file) => file && !/\.(png|jpe?g|webp|woff2?|ico)$|package-lock\.json$/i.test(file));
  const bin = path.join(root, "node_modules", "secretlint", "bin", "secretlint.js");
  const { code } = await run(process.execPath, [bin, "--maskSecrets", ...files]);
  if (code === 0) console.log(`   ${files.length} files scanned, no secrets found`);
  return code;
});

await step(
  "built-site and repo checks",
  async () => (await run(process.execPath, ["scripts/tool.mjs", "vitest", "run", "--project", "security"])).code,
);

const failed = results.filter(([, ok]) => !ok);
console.log(`\nSecurity: ${results.length - failed.length}/${results.length} steps passed`);
process.exit(failed.length ? 1 : 0);
