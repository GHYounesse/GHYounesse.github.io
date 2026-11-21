import type { Page } from "@playwright/test";
import { MOCK_URL } from "../../playwright.config";

export type Submission = { path: string; accept: string; fields: Record<string, string> };

export async function mockRequests(): Promise<Submission[]> {
  return (await fetch(`${MOCK_URL}/__requests`)).json();
}

export async function clearMockRequests(): Promise<void> {
  await fetch(`${MOCK_URL}/__requests`, { method: "DELETE" });
}

/** Collects anything that would show up as a red line in the console of a real visitor. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("requestfailed", (request) =>
    errors.push(`request failed: ${request.url()} (${request.failure()?.errorText})`),
  );
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  return errors;
}

/** Scrolls to the bottom in steps so IntersectionObserver reveals and lazy images fire. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
}
