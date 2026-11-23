import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const git = (...args: string[]) => spawnSync("git", args, { encoding: "utf8" });
const read = (file: string) => readFileSync(file, "utf8");

describe("secrets hygiene", () => {
  it("git ignores .env files", () => {
    expect(git("check-ignore", "-q", ".env").status, ".env must be ignored").toBe(0);
    expect(git("check-ignore", "-q", ".env.local").status, ".env.local must be ignored").toBe(0);
  });

  it("tracks no env file except an example", () => {
    const tracked = git("ls-files").stdout.split("\n").filter(Boolean);
    const envFiles = tracked.filter((file) => /(^|\/)\.env(\..+)?$/.test(file) && !file.endsWith(".example"));
    expect(envFiles).toEqual([]);
  });

  it("tracks no private keys or certificates", () => {
    const tracked = git("ls-files").stdout.split("\n").filter(Boolean);
    expect(tracked.filter((file) => /\.(pem|key|p12|pfx)$|(^|\/)id_(rsa|ed25519)/.test(file))).toEqual([]);
  });
});

describe("Caddy configuration", () => {
  const caddy = read("deploy/Caddyfile.example");

  it("sets the baseline security headers", () => {
    expect(caddy).toMatch(/X-Content-Type-Options\s+nosniff/);
    expect(caddy).toMatch(/Referrer-Policy\s+strict-origin-when-cross-origin/);
    expect(caddy).toMatch(/X-Frame-Options\s+DENY/);
  });

  it("caches hashed assets forever but makes HTML revalidate", () => {
    expect(caddy).toMatch(/\/_astro\/\*/);
    expect(caddy).toMatch(/immutable/);
    expect(caddy).toMatch(/no-cache/);
  });

  it("does not expose a directory listing", () => {
    expect(caddy).not.toMatch(/file_server\s+browse|file_browse/);
  });

  it("redirects www to the apex domain", () => {
    expect(caddy).toMatch(/redir @www https:\/\/younesghalloum\.dev/);
  });
});

describe("deploy workflow", () => {
  const workflow = read(".github/workflows/deploy.yml");

  it("runs with least-privilege token permissions", () => {
    expect(workflow, 'add "permissions: contents: read"').toMatch(/^permissions:\s*\n\s+contents:\s*read/m);
  });

  it("only triggers on pushes to main (never on pull_request_target)", () => {
    expect(workflow).not.toMatch(/pull_request_target/);
    expect(workflow).toMatch(/branches:\s*\[main\]/);
  });

  it("pins third-party actions to a version, never a moving branch", () => {
    for (const [, ref] of workflow.matchAll(/uses:\s*[\w./-]+@(\S+)/g)) {
      expect(ref).toMatch(/^v?\d/);
    }
  });

  it("reads credentials from secrets, locks down the key file, and verifies the host", () => {
    expect(workflow).toMatch(/secrets\.VPS_SSH_KEY/);
    expect(workflow).toMatch(/chmod 600/);
    expect(workflow).toMatch(/ssh-keyscan/);
    expect(workflow).not.toMatch(/StrictHostKeyChecking[ =]no/);
  });

  it("does not print secrets", () => {
    expect(workflow).not.toMatch(/echo\s+.*\$\{\{\s*secrets\./);
    expect(workflow).not.toMatch(/set -x/);
  });
});

describe("supply chain", () => {
  const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };

  it("declares no install-time lifecycle scripts of its own", () => {
    for (const hook of ["preinstall", "install", "postinstall", "prepare"]) {
      expect(pkg.scripts[hook], hook).toBeUndefined();
    }
  });

  it("commits a lockfile so CI installs exactly what was tested", () => {
    expect(git("ls-files", "package-lock.json").stdout.trim()).toBe("package-lock.json");
  });
});
