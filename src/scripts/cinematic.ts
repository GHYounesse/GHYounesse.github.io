/** Cinematic-mode extras: shader hero, smooth scroll, scroll-scrubbed text, parallax, card effects. */
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initHeroShader } from "./hero-shader";
import { initHeroParticles } from "./hero-particles";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const canvas = document.querySelector<HTMLCanvasElement>(".hero-canvas");
if (canvas) initHeroShader(canvas, { animate: !reduceMotion });
// Interactive particle layer: pointer-driven, so only with motion allowed and a fine pointer.
if (canvas && canHover && !reduceMotion) initHeroParticles(canvas.parentElement as HTMLElement);

if (!reduceMotion) {
  // Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
  const lenis = new Lenis({ anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Hero portrait parallax.
  const portraitImg = document.querySelector(".hero-portrait img");
  if (portraitImg) {
    gsap.to(portraitImg, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  // About text: words light up as you scroll through the paragraph.
  document.querySelectorAll<HTMLElement>("[data-words]").forEach((p) => {
    const text = p.textContent ?? "";
    p.setAttribute("aria-label", text);
    p.textContent = "";
    const words = text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const span = document.createElement("span");
        span.className = "word";
        span.setAttribute("aria-hidden", "true");
        span.textContent = word + " ";
        p.appendChild(span);
        return span;
      });
    gsap.fromTo(
      words,
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 58%", scrub: true },
      },
    );
  });
}

// Project cards: cursor spotlight and a small 3D tilt on the screenshot.
if (canHover && !reduceMotion) {
  document.querySelectorAll<HTMLElement>(".project-card").forEach((card) => {
    const mockup = card.querySelector<HTMLElement>(".mockup");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
      if (mockup) {
        const m = mockup.getBoundingClientRect();
        const px = (e.clientX - m.left) / m.width - 0.5;
        const py = (e.clientY - m.top) / m.height - 0.5;
        mockup.style.setProperty("--ry", `${(px * 6).toFixed(2)}deg`);
        mockup.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
      }
    });
    card.addEventListener("pointerleave", () => {
      mockup?.style.setProperty("--rx", "0deg");
      mockup?.style.setProperty("--ry", "0deg");
    });
  });
}
