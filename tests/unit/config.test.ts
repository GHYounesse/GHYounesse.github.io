import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig() {
  vi.resetModules();
  return import("../../src/config");
}

afterEach(() => vi.unstubAllEnvs());

describe("SITE", () => {
  it("posts the contact form to Formspree over https by default", async () => {
    vi.stubEnv("PUBLIC_FORM_ENDPOINT", undefined);
    const { SITE } = await loadConfig();
    expect(SITE.formEndpoint).toMatch(/^https:\/\/formspree\.io\/f\/\w+$/);
  });

  it("lets PUBLIC_FORM_ENDPOINT point the form at the mock service", async () => {
    vi.stubEnv("PUBLIC_FORM_ENDPOINT", "http://127.0.0.1:4010/f/test");
    expect((await loadConfig()).SITE.formEndpoint).toBe("http://127.0.0.1:4010/f/test");
  });

  it("uses https for every public link and a plausible email", async () => {
    const { SITE } = await loadConfig();
    for (const link of [SITE.url, SITE.github, SITE.linkedin]) expect(link).toMatch(/^https:\/\//);
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });
});
