import { readFileSync } from "node:fs";
import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { filesOf, LANGS, readHtml } from "../helpers/dist";

// Checks on what actually ships: the built HTML and JavaScript of every language.
// The only plain-http URL allowed is the local mock Formspree endpoint the test build is pointed at.
const MOCK_HOST = "http://127.0.0.1:4010/";

function parse(html: string) {
  const window = new Window();
  return new window.DOMParser().parseFromString(html, "text/html");
}

describe.each(LANGS)("page /%s", (lang) => {
  const html = readHtml(lang);
  const doc = parse(html);

  it("opens every target=_blank link with rel=noopener noreferrer", () => {
    const links = [...doc.querySelectorAll('a[target="_blank"]')];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const rel = link.getAttribute("rel") ?? "";
      expect(rel, link.getAttribute("href") ?? "").toMatch(/noopener/);
      expect(rel, link.getAttribute("href") ?? "").toMatch(/noreferrer/);
    }
  });

  it("has no inline event handlers and no javascript: URLs", () => {
    for (const el of doc.querySelectorAll("*")) {
      for (const attr of el.getAttributeNames()) {
        expect(attr, `<${el.tagName.toLowerCase()}>`).not.toMatch(/^on/i);
      }
      for (const name of ["href", "src", "action"]) {
        expect(el.getAttribute(name) ?? "", `${name} on <${el.tagName.toLowerCase()}>`).not.toMatch(/^\s*javascript:/i);
      }
    }
  });

  it("loads scripts only from its own origin", () => {
    for (const script of doc.querySelectorAll("script[src]")) {
      const src = script.getAttribute("src")!;
      expect(src, src).toMatch(/^\/(?!\/)/);
    }
  });

  it("keeps inline script to the theme bootstrap, with no eval-like calls and no network access", () => {
    const inline = [...doc.querySelectorAll("script:not([src])")].map((s) => s.textContent ?? "");
    expect(inline.length).toBeLessThanOrEqual(1);
    for (const code of inline) {
      expect(code).not.toMatch(/\beval\s*\(|new Function|document\.write|innerHTML|fetch\(|XMLHttpRequest|WebSocket/);
    }
  });

  it("references subresources over https (or relative paths) only", () => {
    const urls = [...doc.querySelectorAll("[src], link[href], form[action]")].map(
      (el) => el.getAttribute("src") ?? el.getAttribute("href") ?? el.getAttribute("action") ?? "",
    );
    for (const url of urls) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith(MOCK_HOST)) {
        expect(url, url).toMatch(/^https:\/\//);
      }
    }
  });

  it("posts the contact form with POST to an explicit endpoint and requires every field", () => {
    const form = doc.querySelector("form.contact-form")!;
    expect(form.getAttribute("method")?.toUpperCase()).toBe("POST");
    expect(form.getAttribute("action")).toMatch(/^https?:\/\//);
    for (const field of form.querySelectorAll("input, textarea")) {
      expect(field.hasAttribute("required"), field.getAttribute("name") ?? "").toBe(true);
    }
  });

  it("does not leak the local mock endpoint into anything but the form action", () => {
    const withoutAction = html.replace(/action="[^"]*"/g, "");
    expect(withoutAction).not.toContain("127.0.0.1");
    expect(withoutAction).not.toContain("localhost");
  });
});

describe("JavaScript bundles", () => {
  it("ship no source maps and no references to them", () => {
    for (const file of filesOf(".js")) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/sourceMappingURL=/);
    }
    expect(filesOf(".map")).toEqual([]);
  });

  it("contain no eval or document.write", () => {
    for (const file of filesOf(".js")) {
      const code = readFileSync(file, "utf8");
      expect(code, file).not.toMatch(/\beval\s*\(/);
      expect(code, file).not.toMatch(/document\.write\s*\(/);
    }
  });
});

describe("the production build's own links", () => {
  it("never points the contact form at a plain-http endpoint", () => {
    // The test build uses the mock; this guards the source default so a production build can't regress to http.
    const config = readFileSync("src/config.ts", "utf8");
    expect(config).toMatch(/\|\|\s*"https:\/\/formspree\.io\//);
  });
});
