import { expect, test } from "@playwright/test";

test.describe("default theme", () => {
  test.describe("with a light system theme", () => {
    test.use({ colorScheme: "light" });
    test("stays dark: the design is dark-first", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    });
  });

  test.describe("with a dark system theme", () => {
    test.use({ colorScheme: "dark" });
    test("is dark", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    });
  });
});

test("the toggle flips the theme, repaints the page and survives a reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const before = (await html.getAttribute("data-theme")) as "dark" | "light";
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const backgroundBefore = await background();

  await page.locator("[data-theme-toggle]").click();
  const after = before === "dark" ? "light" : "dark";
  await expect(html).toHaveAttribute("data-theme", after);
  await expect.poll(background).not.toBe(backgroundBefore);

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(after);
});

test("the saved theme is applied before first paint (no flash)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"));
  await page.goto("/", { waitUntil: "commit" });
  // The inline <head> script must have set the attribute by the time the document starts parsing the body.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
