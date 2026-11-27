import { expect, test, type Page } from "@playwright/test";

// The desktop slideshow runs with motion on (the rest of the suite uses reduced motion, where it is off by design).
// Headless Chrome paints everything on the CPU, so these stay few and wait on state instead of fixed delays.
test.use({ reducedMotion: "no-preference", viewport: { width: 1280, height: 800 } });
test.setTimeout(60_000);

test.afterEach(async ({ page }) => {
  await page.goto("about:blank");
});

const wait = { timeout: 20_000 };

async function open(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.locator("html")).toHaveClass(/\bslides-live\b/, wait);
}

/** Resolves once the given slide is current and no transition is still running. */
async function onSlide(page: Page, id: string) {
  await expect(page.locator("html")).toHaveAttribute("data-slide", id, wait);
  await expect(page.locator("main > section.is-leaving")).toHaveCount(0, wait);
}

test("starts on the intro with one visible slide and a dot per section", async ({ page }) => {
  await open(page);
  await expect(page.locator("main > section.is-active")).toHaveAttribute("id", "top");
  await expect(page.locator(".slide-nav button")).toHaveCount(6);
  await expect(page.locator("#skills")).toBeHidden();
});

test("arrow keys move between slides and the hash follows", async ({ page }) => {
  await open(page);
  await page.keyboard.press("ArrowRight");
  await onSlide(page, "about");
  await expect(page).toHaveURL(/#about$/);
  await page.keyboard.press("ArrowLeft");
  await onSlide(page, "top");
  await expect(page).not.toHaveURL(/#/);
});

test("the nav button and the dots jump straight to a slide", async ({ page }) => {
  await open(page);
  await page.getByRole("link", { name: "Contact me" }).click();
  await onSlide(page, "contact");
  await expect(page.locator(".site-footer")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "My Skills" }).click();
  await onSlide(page, "skills");
});

test("projects step one at a time before the slideshow moves on", async ({ page }) => {
  await open(page, "/#projects");
  await onSlide(page, "projects");
  const counter = page.locator(".project-pager span");
  await expect(counter).toHaveText("01 / 07");
  await page.getByRole("button", { name: "Next project" }).click();
  await expect(counter).toHaveText("02 / 07");
  await expect(page.locator(".project-card.is-current")).toHaveCount(1);
  await page.getByRole("button", { name: "Previous project" }).click();
  await expect(counter).toHaveText("01 / 07");
});

test("the nav toggle switches to the scrolling page, remembers it, and switches back", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Scroll view" }).click();
  await expect(page.locator("html.slides")).toHaveCount(0, wait);
  expect(await page.evaluate(() => localStorage.getItem("view"))).toBe("scroll");

  await page.reload();
  await expect(page.locator("html.slides")).toHaveCount(0);
  await page.getByRole("button", { name: "Slide view" }).click();
  await expect(page.locator("html.slides-live")).toHaveCount(1, wait);
  expect(await page.evaluate(() => localStorage.getItem("view"))).toBe("slides");
});

test("a deep link opens the matching slide", async ({ page }) => {
  await open(page, "/#skills");
  await expect(page.locator("main > section.is-active")).toHaveAttribute("id", "skills");
});

test("typing in the contact form does not trigger slide navigation", async ({ page }) => {
  await open(page, "/#contact");
  await page.locator("#cf-message").click();
  await page.keyboard.type("hello there, arrow keys ");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("html")).toHaveAttribute("data-slide", "contact");
});

test.describe("fallbacks", () => {
  test("a narrow window keeps the scrolling page", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bslides\b/);
    await expect(page.locator(".slide-nav")).toHaveCount(0);
    await expect(page.locator(".view-toggle")).toBeHidden(); // nothing to switch to on a narrow window
    await expect(page.locator("#contact")).toBeAttached();
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("the page scrolls normally", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).not.toHaveClass(/\bslides\b/);
      await expect(page.locator(".view-toggle")).toBeHidden();
      await page.locator("#contact").scrollIntoViewIfNeeded();
      await expect(page.locator("#contact")).toBeInViewport();
    });
  });
});
