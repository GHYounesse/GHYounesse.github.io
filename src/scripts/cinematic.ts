/** Cinematic-mode extras: shader hero, smooth scroll, scroll-scrubbed text, parallax, card effects. */
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initHeroShader } from "./hero-shader";
import { initHeroParticles } from "./hero-particles";
import { splitWords } from "./words";

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

  // Project screenshots: each one opens up from a framed crop as its card scrolls into view.
  document.querySelectorAll<HTMLElement>(".project-card .mockup > img").forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.2, clipPath: "inset(14% 10% 14% 10% round 16px)" },
      {
        scale: 1,
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        ease: "none",
        scrollTrigger: { trigger: img, start: "top 95%", end: "top 50%", scrub: true },
      },
    );
  });

  // About text: words light up as you scroll through the paragraph.
  document.querySelectorAll<HTMLElement>("[data-words]").forEach((p) => {
    const words = splitWords(p);
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

// Project cards: cursor spotlight, a 3D tilt with a moving glare on the screenshot, and the
// text block drifting slightly the other way so the card reads as layers.
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
        mockup.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
        mockup.style.setProperty("--rx", `${(-py * 10).toFixed(2)}deg`);
        mockup.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
        mockup.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
      }
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--dx", cx.toFixed(3));
      card.style.setProperty("--dy", cy.toFixed(3));
    });
    card.addEventListener("pointerleave", () => {
      for (const name of ["--rx", "--ry"]) mockup?.style.setProperty(name, "0deg");
      card.style.setProperty("--dx", "0");
      card.style.setProperty("--dy", "0");
    });
  });
}
