import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { mockRequests } from "./helpers";

// The mock Formspree service (mocks/formspree-server.mjs) receives these posts: the test builds are created with
// PUBLIC_FORM_ENDPOINT pointing at it. A message containing "__fail__" / "__slow__" picks the response path.
//
// Tests may run in parallel against ONE mock server, so nothing here clears shared state. Each test
// tags its message with a unique token and only looks at its own submission.

const uid = (testInfo: TestInfo) => `${testInfo.project.name}-${testInfo.testId}-${Date.now()}`;

async function fillAndSend(page: Page, message: string, path = "/") {
  await page.goto(path);
  await page.locator("#cf-name").fill("Ada Lovelace");
  await page.locator("#cf-email").fill("ada@example.com");
  await page.locator("#cf-message").fill(message);
  await page.locator(".contact-form button[type=submit]").click();
}

test("sends the message to the endpoint and confirms it", async ({ page }, testInfo) => {
  const message = `Hello from ${uid(testInfo)}`;
  await fillAndSend(page, message);

  const status = page.locator(".form-status");
  await expect(status).toHaveText(/Thanks — your message is sent/);
  await expect(status).toHaveClass(/success/);
  await expect(page.locator("#cf-message")).toHaveValue("");

  const mine = (await mockRequests()).filter((r) => r.fields.message === message);
  expect(mine).toHaveLength(1);
  expect(mine[0].accept).toContain("application/json");
  expect(mine[0].fields).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", message });
});

test("keeps what the visitor typed and shows the fallback when the endpoint fails", async ({ page }, testInfo) => {
  const message = `${uid(testInfo)} __fail__`;
  await fillAndSend(page, message);

  const status = page.locator(".form-status");
  await expect(status).toHaveText(/Something went wrong/);
  await expect(status).toHaveClass(/error/);
  await expect(page.locator("#cf-message")).toHaveValue(message);
});

test("shows a pending state while the request is in flight", async ({ page }, testInfo) => {
  await fillAndSend(page, `${uid(testInfo)} __slow__`);

  const status = page.locator(".form-status");
  await expect(status).toHaveText("Sending...");
  await expect(status).toHaveText(/Thanks/, { timeout: 8_000 });
});

test("shows the French messages on the French page", async ({ page }, testInfo) => {
  await fillAndSend(page, `Bonjour ${uid(testInfo)}`, "/fr/");
  await expect(page.locator(".form-status")).toHaveText(/Merci — votre message a bien été envoyé/);
});

test("does not send anything when required fields are empty", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });

  await page.goto("/");
  await page.locator(".contact-form button[type=submit]").click();
  await page.waitForTimeout(300);

  expect(posts).toEqual([]);
  await expect(page.locator("#cf-name")).toHaveJSProperty("validity.valueMissing", true);
});

test("has labelled, autocomplete-aware inputs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Your Name")).toHaveAttribute("autocomplete", "name");
  await expect(page.getByLabel("Your Email")).toHaveAttribute("type", "email");
  await expect(page.getByLabel("Your Message")).toBeVisible();
});
