// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ui.ts always schedules the cinematic extras (GSAP, Lenis, WebGL) for after load. boot() replaces that module with a
// stub that just counts how often it was loaded, so no test pulls the real libraries into the simulated DOM.
const cinematic = { loads: 0 };

/** Boots src/scripts/ui.ts against a fresh document, the way the browser does after parsing the page. */
async function boot(body: string, { lang = "en", reduceMotion = false } = {}) {
  vi.resetModules();
  const matchMedia = (query: string) => ({
    matches: reduceMotion && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  });
  vi.stubGlobal("matchMedia", matchMedia);
  window.matchMedia = matchMedia as unknown as typeof window.matchMedia;

  document.documentElement.lang = lang;
  document.body.innerHTML = body;
  vi.doMock("../../src/scripts/cinematic", () => {
    cinematic.loads++;
    return {};
  });
  await import("../../src/scripts/ui");
}

const FORM = `
  <form class="contact-form" action="http://127.0.0.1:4010/f/test" method="POST"
        data-sending="Sending..." data-sent="Thanks!" data-error="Oops">
    <input name="name" /><input name="email" /><textarea name="message"></textarea>
    <button type="submit">Send</button>
    <p class="form-status" role="status"></p>
  </form>`;

/** Types into the form like a user would (so form.reset() has real defaults to go back to). */
function fill() {
  const set = (name: string, value: string) =>
    (document.querySelector<HTMLInputElement>(`[name=${name}]`)!.value = value);
  set("name", "Ada");
  set("email", "ada@example.com");
  set("message", "hello");
}

const submit = (form: HTMLFormElement) => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("theme toggle", () => {
  const html = `<button data-theme-toggle>theme</button>`;

  it("flips between dark and light and remembers the choice", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    await boot(html);
    const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]")!;

    button.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");

    button.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("still toggles when storage is unavailable", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    await boot(html);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    document.querySelector<HTMLButtonElement>("[data-theme-toggle]")!.click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("reveal on scroll", () => {
  const html = `<section data-reveal id="a"></section><section data-reveal id="b"></section>`;

  it("shows everything immediately under prefers-reduced-motion", async () => {
    await boot(html, { reduceMotion: true });
    document.querySelectorAll("[data-reveal]").forEach((el) => expect(el.classList.contains("is-visible")).toBe(true));
  });

  it("reveals an element once, when it scrolls into view", async () => {
    const instances: { cb: IntersectionObserverCallback; unobserved: Element[] }[] = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        unobserved: Element[] = [];
        constructor(public cb: IntersectionObserverCallback) {
          instances.push(this);
        }
        observe() {}
        unobserve(el: Element) {
          this.unobserved.push(el);
        }
        disconnect() {}
      },
    );
    await boot(html);

    const a = document.getElementById("a")!;
    const b = document.getElementById("b")!;
    expect(a.classList.contains("is-visible")).toBe(false);

    const entry = { isIntersecting: true, target: a } as unknown as IntersectionObserverEntry;
    instances[0].cb([entry], instances[0] as never);
    expect(a.classList.contains("is-visible")).toBe(true);
    expect(b.classList.contains("is-visible")).toBe(false);
    expect(instances[0].unobserved).toContain(a);
  });
});

describe("contact form", () => {
  const field = (name: string) => document.querySelector<HTMLInputElement>(`[name=${name}]`)!;

  it("posts the fields as JSON-accepting FormData and confirms success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    await boot(FORM);
    fill();
    const form = document.querySelector<HTMLFormElement>(".contact-form")!;
    const status = form.querySelector<HTMLElement>(".form-status")!;

    submit(form);
    expect(status.textContent).toBe("Sending...");

    await vi.waitFor(() => expect(status.textContent).toBe("Thanks!"));
    expect(status.classList.contains("success")).toBe(true);
    expect(field("message").value).toBe("");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://127.0.0.1:4010/f/test");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ Accept: "application/json" });
    expect((init.body as FormData).get("email")).toBe("ada@example.com");
  });

  it("shows the error message when the endpoint answers with a failure status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await boot(FORM);
    fill();
    const form = document.querySelector<HTMLFormElement>(".contact-form")!;
    const status = form.querySelector<HTMLElement>(".form-status")!;

    submit(form);
    await vi.waitFor(() => expect(status.textContent).toBe("Oops"));
    expect(status.classList.contains("error")).toBe(true);
    expect(field("message").value, "a failed send must not wipe the user's message").toBe("hello");
  });

  it("shows the error message when the network request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await boot(FORM);
    fill();
    const form = document.querySelector<HTMLFormElement>(".contact-form")!;
    const status = form.querySelector<HTMLElement>(".form-status")!;

    submit(form);
    await vi.waitFor(() => expect(status.classList.contains("error")).toBe(true));
    expect(field("message").value).toBe("hello");
  });

  it("clears an earlier error when the next attempt succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }).mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await boot(FORM);
    const form = document.querySelector<HTMLFormElement>(".contact-form")!;
    const status = form.querySelector<HTMLElement>(".form-status")!;

    submit(form);
    await vi.waitFor(() => expect(status.classList.contains("error")).toBe(true));
    submit(form);
    await vi.waitFor(() => expect(status.classList.contains("success")).toBe(true));
    expect(status.classList.contains("error")).toBe(false);
  });
});

describe("typing effect", () => {
  const html = `<span data-typing='["Dev","Ops"]'>Dev</span>`;

  it("types every title, then settles back on the first", async () => {
    vi.useFakeTimers();
    await boot(html);
    const el = document.querySelector<HTMLElement>("[data-typing]")!;

    const seen = new Set<string>();
    new MutationObserver(() => seen.add(el.textContent ?? "")).observe(el, { childList: true, characterData: true });

    await vi.advanceTimersByTimeAsync(30_000);
    expect(seen).toContain("Ops");
    expect(seen).toContain("");
    expect(el.textContent).toBe("Dev");
  });

  it("leaves the text alone under prefers-reduced-motion", async () => {
    vi.useFakeTimers();
    await boot(html, { reduceMotion: true });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(document.querySelector("[data-typing]")!.textContent).toBe("Dev");
  });
});

describe("deferred cinematic code", () => {
  const idleCallbacks: Array<() => void> = [];
  const setIdle = (fn: unknown) => {
    vi.stubGlobal("requestIdleCallback", fn);
    (window as unknown as Record<string, unknown>).requestIdleCallback = fn;
  };
  const setReadyState = (state: DocumentReadyState) =>
    Object.defineProperty(document, "readyState", { value: state, configurable: true });

  beforeEach(() => {
    cinematic.loads = 0;
    idleCallbacks.length = 0;
    setIdle((callback: () => void) => idleCallbacks.push(callback));
  });
  afterEach(() => {
    Reflect.deleteProperty(document, "readyState");
  });

  it("is not loaded at startup, only when the browser is idle after the page has loaded", async () => {
    setReadyState("complete");
    await boot("<div></div>");

    expect(cinematic.loads).toBe(0);
    expect(idleCallbacks).toHaveLength(1);

    idleCallbacks[0]();
    await vi.waitFor(() => expect(cinematic.loads).toBe(1));
  });

  it("waits for the load event while the page is still loading", async () => {
    setReadyState("loading");
    await boot("<div></div>");
    expect(idleCallbacks).toHaveLength(0);
    expect(cinematic.loads).toBe(0);

    window.dispatchEvent(new Event("load"));
    expect(idleCallbacks).toHaveLength(1);
    idleCallbacks[0]();
    await vi.waitFor(() => expect(cinematic.loads).toBe(1));
  });

  it("falls back to a short timer where requestIdleCallback does not exist", async () => {
    vi.useFakeTimers();
    setIdle(undefined);
    setReadyState("complete");
    await boot("<div></div>");
    expect(cinematic.loads).toBe(0);

    await vi.advanceTimersByTimeAsync(250);
    await vi.waitFor(() => expect(cinematic.loads).toBe(1));
  });
});
