import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { normalizeCwd, root } from "./cwd.mjs";

normalizeCwd();

/**
 * Runs a command, streaming its output, and resolves with its exit code (never rejects).
 * `npm`/`npx` need a shell on Windows because they are .cmd shims.
 *
 * `lowPriority` runs it (and everything it starts, e.g. Chrome) below normal OS priority so the machine stays
 * responsive while heavy browser work runs. Children inherit the priority of the process that spawned them.
 *
 * `timeoutMs` is a hard stop: the whole process tree (including any Chrome it launched) is killed and the
 * result is `{ code: 124, timedOut: true }`, so a stuck tool can never hang the loop.
 */
export function run(
  command,
  args = [],
  { env = {}, cwd = root, quiet = false, lowPriority = false, timeoutMs = 0 } = {},
) {
  return new Promise((resolve) => {
    const useShell = process.platform === "win32" && /^(npm|npx)$/.test(command);
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: useShell,
      stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let timedOut = false;
    const timer = timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          if (process.platform === "win32")
            spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
          else child.kill("SIGKILL");
        }, timeoutMs)
      : undefined;
    if (lowPriority && child.pid) {
      try {
        os.setPriority(child.pid, os.constants.priority.PRIORITY_BELOW_NORMAL);
      } catch {
        // Not permitted or already exited: harmless, it just runs at normal priority.
      }
    }
    let output = "";
    child.stdout?.on("data", (chunk) => (output += chunk));
    child.stderr?.on("data", (chunk) => (output += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: 1, output: String(error) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve(timedOut ? { code: 124, output, timedOut: true } : { code: code ?? 1, output });
    });
  });
}

/** Resolves to the Astro CLI entry so we can launch it with `node` (no shell, no PATH lookups). */
export const astroBin = path.join(root, "node_modules", "astro", "bin", "astro.mjs");
