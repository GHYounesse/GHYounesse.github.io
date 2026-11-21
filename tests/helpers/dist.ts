import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

export const LANGS = ["", "fr"] as const; // "" is the English page at /

/** The test build made by `npm run build:test`. */
const ROOT = path.resolve(".test-dist");

export function distDir() {
  if (!existsSync(path.join(ROOT, "index.html"))) {
    throw new Error(`No test build in ${ROOT}. Run "npm run build:test" first.`);
  }
  return ROOT;
}

export function readHtml(lang: (typeof LANGS)[number] = "") {
  return readFileSync(path.join(distDir(), lang, "index.html"), "utf8");
}

export function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export const filesOf = (ext: string) => walk(distDir()).filter((file) => file.endsWith(ext));
export const bytes = (file: string) => statSync(file).size;
export const gzipBytes = (input: string | Buffer) => gzipSync(input).length;
export const gzipFile = (file: string) => gzipBytes(readFileSync(file));

/** Resolves a URL used in the HTML (absolute path like /_astro/x.js) to a file in the build. */
export function resolveAsset(url: string) {
  const clean = url.split("?")[0].split("#")[0];
  return path.join(distDir(), clean.replace(/^\//, ""));
}
