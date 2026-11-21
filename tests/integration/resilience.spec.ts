import { expect, test } from "@playwright/test";

test.describe("with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("the page is fully readable (scroll reveals and intros never hide content)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bjs\b/);
    await expect(page.locator("h1")).toBeVisible();
    for (const section of ["#about", "#skills", "#projects", "#journey", "#contact"]) {
      await expect(page.locator(`${section} h2`), section).toBeVisible();
    }
    for (const selector of [".hero-copy [data-intro]", ".project-card", ".timeline-item"]) {
      await expect(page.locator(selector).first(), selector).toHaveCSS("opacity", "1");
    }
  });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows below-the-fold content immediately and does not animate the typing line", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#contact")).toHaveCSS("opacity", "1");
    await expect(page.locator(".project-card").last()).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-typing]")).toHaveText("Full-Stack Developer");
  });

  test("stops the marquee", async ({ page }) => {
    await page.goto("/");
    const track = page.locator(".marquee-track");
    await expect(track).toHaveCSS("animation-name", "none");
  });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("keeps the navigation to one compact row", async ({ page }) => {
    await page.goto("/");
    const box = await page.locator("nav").boundingBox();
    expect(box?.height ?? 999).toBeLessThan(90);
    await expect(page.locator("[data-theme-toggle]")).toBeVisible();
    await expect(page.locator(".lang-switch")).toBeVisible();
  });

  test("keeps tap targets reachable: the hero call to action is fully inside the viewport width", async ({ page }) => {
    await page.goto("/");
    const box = await page.locator(".hero-cta").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  });
});

test("the call to action scrolls to the projects section", async ({ page }) => {
  await page.goto("/");
  await page.locator(".hero-cta").click();
  await expect
    .poll(() => page.evaluate(() => document.querySelector("#projects")!.getBoundingClientRect().top), {
      timeout: 8_000,
    })
    .toBeLessThan(250);
});

test("the skip link is the first focusable element and becomes visible on focus", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  expect((await skip.boundingBox())!.y).toBeGreaterThanOrEqual(0);
});

test("external links open safely", async ({ page }) => {
  await page.goto("/");
  const links = page.locator('a[target="_blank"]');
  const count = await links.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(links.nth(i)).toHaveAttribute("rel", /noopener/);
  }
});
