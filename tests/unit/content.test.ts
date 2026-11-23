import { describe, expect, it } from "vitest";
import { en } from "../../src/content/en";
import { fr } from "../../src/content/fr";
import { projectMeta, skillGroups, timelinePeriods } from "../../src/content/shared";
import type { Content } from "../../src/content/types";

const languages: [string, Content][] = [
  ["en", en],
  ["fr", fr],
];

/** Collapses a value to its structure (keys, array lengths, primitive types) so two languages can be compared. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, shape(child)]),
    );
  }
  return typeof value;
}

function strings(value: unknown, trail = ""): [string, string][] {
  if (typeof value === "string") return [[trail, value]];
  if (Array.isArray(value)) return value.flatMap((child, i) => strings(child, `${trail}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => strings(child, trail ? `${trail}.${key}` : key));
  }
  return [];
}

describe("EN and FR content stay in sync", () => {
  it("have identical structure (same keys, same list lengths)", () => {
    expect(shape(fr)).toEqual(shape(en));
  });

  it("list the projects in the same order", () => {
    expect(fr.projects.items.map((p) => p.id)).toEqual(en.projects.items.map((p) => p.id));
  });

  it("actually translate the prose (nothing was copy-pasted)", () => {
    expect(fr.about.text).not.toBe(en.about.text);
    expect(fr.hero.cta).not.toBe(en.hero.cta);
    expect(fr.nav.contact).not.toBe(en.nav.contact);
    fr.projects.items.forEach((project, i) => expect(project.desc).not.toBe(en.projects.items[i].desc));
    fr.timeline.items.forEach((text, i) => expect(text).not.toBe(en.timeline.items[i]));
  });
});

describe.each(languages)("%s content", (lang, content) => {
  it("declares its own language code", () => {
    expect(content.lang).toBe(lang);
  });

  it("has no empty, padded or double-spaced strings", () => {
    for (const [where, text] of strings(content)) {
      expect(text.trim(), where).not.toBe("");
      expect(text, where).toBe(text.trim());
      expect(text, where).not.toMatch(/ {2,}/);
      expect(text.toLowerCase(), where).not.toMatch(/lorem|todo|fixme/);
    }
  });

  it("has SEO-sized title and description", () => {
    expect(content.meta.title.length).toBeLessThanOrEqual(70);
    expect(content.meta.description.length).toBeGreaterThanOrEqual(50);
    expect(content.meta.description.length).toBeLessThanOrEqual(160);
  });

  it("has one timeline entry per period", () => {
    expect(content.timeline.items).toHaveLength(timelinePeriods.length);
  });

  it("labels every skill group and lists spoken languages", () => {
    expect(Object.keys(content.skills.labels).sort()).toEqual(skillGroups.map((g) => g.id).sort());
    expect(content.skills.languages.length).toBeGreaterThan(0);
  });

  it("only references projects that exist, each exactly once", () => {
    const ids = content.projects.items.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(projectMeta[id], `unknown project "${id}"`).toBeDefined();
    expect(ids.sort()).toEqual(Object.keys(projectMeta).sort());
  });
});

describe("shared data", () => {
  it("gives every project an https link and a non-empty, duplicate-free stack", () => {
    for (const [id, meta] of Object.entries(projectMeta)) {
      expect(meta.href, id).toMatch(/^https:\/\//);
      expect(meta.stack.length, id).toBeGreaterThan(0);
      expect(new Set(meta.stack).size, id).toBe(meta.stack.length);
    }
  });

  it("keeps skill items unique within a group", () => {
    for (const group of skillGroups) {
      const items: readonly string[] = group.items;
      expect(new Set(items).size, group.id).toBe(items.length);
      items.forEach((item) => expect(item.trim(), group.id).not.toBe(""));
    }
  });

  it("has unique timeline periods", () => {
    expect(new Set(timelinePeriods).size).toBe(timelinePeriods.length);
  });
});
