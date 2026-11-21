import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

test("serves the French page at /fr/ with French content", async ({ page }) => {
  const errors = trackErrors(page);
  const response = await page.goto("/fr/");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page).toHaveTitle(/Développeur Full-Stack/);
  await expect(page.locator("h1")).toContainText("Bonjour");
  await expect(page.getByRole("link", { name: "Contactez-moi" })).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(7);
  await expect(page.locator(".skill-row")).toHaveCount(6);
  await expect(page.locator(".timeline-item")).toHaveCount(6);
  expect(errors).toEqual([]);
});

test("declares canonical and hreflang alternates for both languages", async ({ page }) => {
  for (const [path, canonical] of [
    ["/", "https://younesghalloum.dev/"],
    ["/fr/", "https://younesghalloum.dev/fr/"],
  ]) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute(
      "href",
      "https://younesghalloum.dev/fr/",
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      "href",
      "https://younesghalloum.dev/",
    );
  }
});

test("the language switch navigates between the two pages and marks the current one", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.lang-option[aria-current="true"]')).toHaveText("EN");

  await page.locator('.lang-option[hreflang="fr"]').click();
  await expect(page).toHaveURL(/\/fr\/$/);
  await expect(page.locator('.lang-option[aria-current="true"]')).toHaveText("FR");

  await page.locator('.lang-option[hreflang="en"]').click();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("EN and FR render the same sections in the same order", async ({ page }) => {
  const sectionIds = async (path: string) => {
    await page.goto(path);
    return page.locator("main section.section").evaluateAll((els) => els.map((el) => el.id));
  };
  const en = await sectionIds("/");
  const fr = await sectionIds("/fr/");
  expect(fr).toEqual(en);
  expect(en).toEqual(["about", "skills", "projects", "journey", "contact"]);
});
