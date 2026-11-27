import gsap from "gsap";
import { nextMove, slideFromHash, acceptWheel, type Position } from "./slide-steps";
import { lightWords, swapProject, transitions } from "./slide-transitions";
import { splitWords } from "./words";

/**
 * Slideshow layout for desktop. The sections stay in the DOM in reading order (SEO, screen readers, the
 * scrolling fallback); this controller only decides which one is visible and animates between them.
 * Wheel, arrow keys, the dots on the right, the nav and hash links all go through `move()`.
 */
export function initSlideshow(opts: { shiftBackground: (value: number) => void }) {
  const root = document.documentElement;
  const main = document.querySelector<HTMLElement>("main");
  const hero = document.querySelector<HTMLElement>("#top");
  if (!main || !hero) return;

  const slides = ["top", "about", "skills", "projects", "journey", "contact"]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);
  const ids = slides.map((s) => s.id);
  const stepping = ids.indexOf("projects");
  const cards = [...document.querySelectorAll<HTMLElement>(".project-card")];
  const layout = { slides: slides.length, stepping, items: cards.length };
  const nav = document.querySelector("nav");

  // Layout plumbing: the nav height drives the stage height; the ticker joins the hero slide.
  const setNavHeight = () => root.style.setProperty("--nav-h", `${nav?.offsetHeight ?? 92}px`);
  setNavHeight();
  window.addEventListener("resize", setNavHeight);
  const marquee = main.querySelector<HTMLElement>(":scope > .marquee");
  if (marquee) hero.append(marquee);

  const labels = slides.map((s) =>
    s.id === "top" ? (main.dataset.home ?? "") : (s.querySelector("h2")?.textContent ?? s.id),
  );

  // About text: split into words so they can light up on arrival.
  const words = [...document.querySelectorAll<HTMLElement>("[data-words]")].flatMap((p) => splitWords(p));
  gsap.set(words, { opacity: 0.16 });

  // ---- chrome: dots, project pager, live region ----
  const dots = document.createElement("div");
  dots.className = "slide-nav";
  dots.setAttribute("role", "navigation");
  dots.setAttribute("aria-label", main.dataset.sections ?? "");
  const dotButtons = slides.map((slide, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.label = labels[i];
    button.setAttribute("aria-label", labels[i]);
    button.addEventListener("click", () => goTo(i));
    dots.append(button);
    return button;
  });
  main.after(dots);

  const live = document.createElement("p");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  main.after(live);

  const projectsSection = slides[stepping];
  const pager = document.createElement("div");
  pager.className = "project-pager";
  const prev = document.createElement("button");
  const next = document.createElement("button");
  const count = document.createElement("span");
  prev.type = next.type = "button";
  prev.textContent = "←";
  next.textContent = "→";
  prev.setAttribute("aria-label", projectsSection?.dataset.prev ?? "Previous");
  next.setAttribute("aria-label", projectsSection?.dataset.next ?? "Next");
  prev.addEventListener("click", () => move(-1, true));
  next.addEventListener("click", () => move(1, true));
  pager.append(prev, count, next);
  projectsSection?.querySelector(".lead")?.after(pager);

  // ---- state ----
  const at: Position = { slide: 0, project: 0 };
  let busy = false;
  let lastWheel = 0;

  const showProject = (n: number) => {
    cards.forEach((card, i) => card.classList.toggle("is-current", i === n));
    count.textContent = `${String(n + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  };
  const paint = (slide: number) => {
    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === slide);
      s.toggleAttribute("inert", i !== slide);
    });
    dotButtons.forEach((b, i) =>
      i === slide ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current"),
    );
    root.dataset.slide = ids[slide];
    live.textContent = `${slide + 1} / ${slides.length}: ${labels[slide]}`;
    history.replaceState(null, "", slide === 0 ? location.pathname + location.search : `#${ids[slide]}`);
  };

  /** Everything the transitions animate besides the slides themselves (never the word spans: they keep tweening). */
  const ANIMATED =
    "h2, .lead, .skill-row, .about-tiles li, .timeline-item, .projects-grid, .project-pager, .contact-actions, .contact-form > *";
  const offset = { v: 0 };

  const finish = (from: HTMLElement, to: HTMLElement) => {
    for (const el of [from, to]) {
      gsap.set([el, ...el.querySelectorAll(ANIMATED)], { clearProps: "transform,opacity,clipPath,scale,x,y,xPercent" });
      el.classList.remove("is-entering", "is-leaving");
    }
    busy = false;
    lastWheel = performance.now();
  };

  function goTo(slide: number, project = at.project, instant = false) {
    if (busy || slide === at.slide || slide < 0 || slide >= slides.length) return;
    const dir: 1 | -1 = slide > at.slide ? 1 : -1;
    const from = slides[at.slide];
    const to = slides[slide];
    const lower = Math.min(at.slide, slide); // transitions[i] joins slide i and i + 1
    if (slide === stepping) showProject(project);
    at.slide = slide;
    at.project = project;
    paint(slide);
    gsap.to(offset, {
      v: slide * 0.55,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => opts.shiftBackground(offset.v),
    });
    if (instant) return;

    busy = true;
    from.classList.add("is-leaving");
    to.classList.add("is-entering");
    // Whichever slide comes later in the story is drawn on top, so wipes and zooms read the same both ways.
    from.style.zIndex = String(dir > 0 ? 1 : 2);
    to.style.zIndex = String(dir > 0 ? 2 : 1);
    const tl = transitions[Math.min(lower, transitions.length - 1)](from, to, dir);
    if (ids[slide] === "about") {
      gsap.set(words, { opacity: 0.16 });
      lightWords(words, 0.7);
    }
    tl.eventCallback("onComplete", () => {
      from.style.zIndex = to.style.zIndex = "";
      finish(from, to);
    });
  }
  function move(dir: 1 | -1, fromUi = false) {
    if (busy) return;
    const result = nextMove(at, dir, layout);
    if (result.kind === "none") return;
    if (result.kind === "slide") {
      goTo(result.to.slide, result.to.project);
      return;
    }
    const out = cards[at.project];
    const into = cards[result.to.project];
    busy = true;
    at.project = result.to.project;
    showProject(at.project);
    out.classList.add("is-current"); // keep the old card visible while it leaves
    swapProject(out, into, dir).eventCallback("onComplete", () => {
      out.classList.remove("is-current");
      gsap.set([out, into, ...into.querySelectorAll(".mockup, .project-details > *")], {
        clearProps: "transform,opacity,clipPath,x,y",
      });
      busy = false;
      lastWheel = performance.now();
    });
    if (fromUi) lastWheel = performance.now();
  }

  // ---- input ----
  /** True when the slide can still scroll in that direction (a short window, a long contact form). */
  const canScrollInside = (dir: number) => {
    const el = slides[at.slide];
    if (getComputedStyle(el).overflowY === "hidden" || el.scrollHeight <= el.clientHeight + 2) return false;
    return dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 2 : el.scrollTop > 2;
  };

  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return; // pinch-zoom and sideways scroll
      const dir = e.deltaY > 0 ? 1 : -1;
      if (canScrollInside(dir)) return;
      e.preventDefault();
      const now = performance.now();
      const ok = acceptWheel(now, lastWheel, busy);
      lastWheel = now;
      if (ok && Math.abs(e.deltaY) > 4) move(dir);
    },
    { passive: false },
  );

  window.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [contenteditable]") || e.altKey || e.ctrlKey || e.metaKey) return;
    const interactive = !!t.closest("button, a, summary");
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
        move(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        move(-1);
        break;
      case " ":
        if (interactive) return;
        move(e.shiftKey ? -1 : 1);
        break;
      case "Home":
        goTo(0);
        break;
      case "End":
        goTo(slides.length - 1);
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  // In-page links (nav "Contact me", hero button, hash links) jump to the matching slide.
  document.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const target = link ? slideFromHash(link.getAttribute("href") ?? "", ids) : -1;
    if (target < 0) return;
    e.preventDefault();
    goTo(target);
  });
  window.addEventListener("hashchange", () => {
    const target = slideFromHash(location.hash, ids);
    if (target >= 0) goTo(target);
  });

  // Leaving the desktop layout (window shrunk below the breakpoint): reload into the scrolling page.
  window
    .matchMedia("(min-width: 1024px) and (min-height: 640px)")
    .addEventListener("change", (e) => !e.matches && location.reload());

  // ---- start ----
  const start = slideFromHash(location.hash, ids); // read before paint() rewrites the hash
  showProject(0);
  paint(0);
  root.classList.add("slides-live");
  if (start > 0) {
    goTo(start, 0, true);
    offset.v = start * 0.55;
    opts.shiftBackground(offset.v);
  }
}
