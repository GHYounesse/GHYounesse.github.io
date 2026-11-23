import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Windows: when the shell's cwd has a lowercase drive letter ("c:\..."), Astro/Vite build the CSS but never
 * inject it into the HTML. Every script that launches Astro calls this first so the loop works from any terminal.
 */
export function normalizeCwd() {
  if (process.platform !== "win32") return;
  const cwd = process.cwd();
  const fixed = cwd.replace(/^[a-z]:/, (drive) => drive.toUpperCase());
  if (fixed !== cwd) process.chdir(fixed);
}

/** Absolute project root (the folder that holds package.json), with an uppercase drive letter on Windows. */
export const root = path
  .resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
  .replace(/^[a-z]:/, (d) => d.toUpperCase());
