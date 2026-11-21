/** Behaviour for the whole page: theme toggle, typing effect, reveal-on-scroll, contact form, and the late-loaded animation code. */

// Marks this file as a module so its top-level names (e.g. `status`) don't clash with browser globals.
export {};

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Theme toggle (initial theme is set by the inline script in Base.astro) ----
document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
  });
});

// ---- Reveal on scroll (CSS handles the transition; see global.css) ----
const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  revealEls.forEach((el) => io.observe(el));
}

// ---- Typing effect: type each title once, then settle on the first ----
const typingEl = document.querySelector<HTMLElement>("[data-typing]");
if (typingEl && !reduceMotion) {
  const titles: string[] = JSON.parse(typingEl.dataset.typing ?? "[]");
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const typeOut = async (text: string, delay: number) => {
    for (let n = 1; n <= text.length; n++) {
      typingEl.textContent = text.slice(0, n);
      await sleep(delay);
    }
  };
  const erase = async (text: string, delay: number) => {
    for (let n = text.length - 1; n >= 0; n--) {
      typingEl.textContent = text.slice(0, n);
      await sleep(delay);
    }
  };

  (async () => {
    typingEl.textContent = "";
    for (const title of titles) {
      await typeOut(title, 70);
      await sleep(900);
      await erase(title, 35);
    }
    await typeOut(titles[0], 70);
  })();
}

// ---- Contact form (Formspree) ----
const form = document.querySelector<HTMLFormElement>(".contact-form");
const status = form?.querySelector<HTMLElement>(".form-status");
if (form && status) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = form.dataset.sending ?? "";
    status.className = "form-status";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Form submission failed: ${res.status}`);
      status.textContent = form.dataset.sent ?? "";
      status.classList.add("success");
      form.reset();
    } catch {
      status.textContent = form.dataset.error ?? "";
      status.classList.add("error");
    }
  });
}

// ---- Cinematic extras are code-split and loaded late ----

/**
 * Runs `task` once the page has finished loading and the browser is idle. The cinematic extras (GSAP, Lenis, the
 * shader) are decoration, so they must not compete with first paint and early interactivity: loading them
 * straight away cost over a second of main-thread blocking in Lighthouse.
 */
function afterLoadWhenIdle(task: () => void) {
  const schedule = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(task, { timeout: 2000 });
    else window.setTimeout(task, 200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
}

afterLoadWhenIdle(() => {
  import("./cinematic").catch((error) => console.warn("Cinematic effects failed to load:", error));
});
