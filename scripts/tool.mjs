// Runs a locally installed CLI with the Windows drive-letter fix applied (see lib/cwd.mjs):
//   node scripts/tool.mjs <eslint|stylelint|prettier|vitest|playwright|html-validate|lhci|secretlint|...> [args]
// Vitest and Astro both misbehave when the shell's cwd has a lowercase drive letter; this makes every npm script
// work from any terminal (VS Code, Git Bash, PowerShell, cmd).
import { readFileSync } from "node:fs";
import path from "node:path";
import { root } from "./lib/cwd.mjs";
import { run } from "./lib/run.mjs";

const PACKAGE_OF = { playwright: "@playwright/test", lhci: "@lhci/cli" };

const [name, ...args] = process.argv.slice(2);
if (!name) {
  console.error("usage: node scripts/tool.mjs <tool> [args]");
  process.exit(2);
}

const pkgDir = path.join(root, "node_modules", PACKAGE_OF[name] ?? name);
const pkg = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8"));
const bin = typeof pkg.bin === "string" ? pkg.bin : (pkg.bin?.[name] ?? Object.values(pkg.bin ?? {})[0]);
if (!bin) {
  console.error(`"${name}" does not expose a CLI`);
  process.exit(2);
}

const { code } = await run(process.execPath, [path.join(pkgDir, bin), ...args]);
process.exit(code);
