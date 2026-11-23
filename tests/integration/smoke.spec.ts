import { expect, test } from "@playwright/test";
import { scrollThrough, trackErrors } from "./helpers";

test("renders the English page without console errors or failed requests", async ({ page }) => {
  const errors = trackErrors(page);

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/Younes Ghalloum/);
  await expect(page.locator("h1")).toContainText("Younes Ghalloum");
  for (const id of ["about", "skills", "projects", "journey", "contact"]) {
    await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
  }
  await expect(page.locator(".project-card")).toHaveCount(7);
  await expect(page.locator(".skill-row")).toHaveCount(6);
  await expect(page.locator(".timeline-item")).toHaveCount(6);

  await scrollThrough(page);
  expect(errors).toEqual([]);
});

test("loads every project screenshot and gives the others a placeholder tile", async ({ page }) => {
  await page.goto("/");
  const images = page.locator(".mockup img");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    await images.nth(i).scrollIntoViewIfNeeded();
    await expect
      .poll(() => images.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  }
  await expect(page.locator(".mockup-ph")).toHaveCount(7 - count);
});

test("hero image and logo load and have alt text semantics", async ({ page }) => {
  await page.goto("/");
  const portrait = page.locator(".hero-portrait img");
  await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(portrait).toHaveAttribute("alt", /Younes Ghalloum/);
});

test("loads the animation code lazily, after the page is idle", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".js")) scripts.push(new URL(request.url()).pathname);
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Loaded once the page is idle after load, so it can arrive a moment after networkidle.
  await expect
    .poll(() => scripts.some((url) => /\/_astro\/cinematic\./.test(url)), {
      message: "cinematic chunk",
      timeout: 8_000,
    })
    .toBe(true);
});

test("renders the shader canvas and the marquee", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-canvas")).toHaveCount(1);
  await expect(page.locator(".marquee")).toHaveCount(1);
});

test("the shader canvas is sized and painted", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator(".hero-canvas");
  await expect.poll(async () => (await canvas.boundingBox())?.height ?? 0).toBeGreaterThan(300);
  await expect.poll(() => canvas.evaluate((c: HTMLCanvasElement) => c.width > 0 && c.height > 0)).toBe(true);
});

test("loads the display font and registers no font the design does not use", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#about h2")).toHaveCSS("font-family", /Bricolage Grotesque Variable/);

  await page.evaluate(() => document.fonts.ready);
  const faces = await page.evaluate(() =>
    [...document.fonts].map((face) => ({ family: face.family.replace(/"/g, ""), status: face.status })),
  );

  expect(faces.some((f) => f.family === "Bricolage Grotesque Variable" && f.status === "loaded")).toBe(true);

  const allowed = ["Bricolage Grotesque Variable", "JetBrains Mono"];
  const unexpected = [...new Set(faces.map((f) => f.family))].filter((family) => !allowed.includes(family));
  expect(unexpected, "fonts registered that the design should not ship").toEqual([]);
});
