import gsap from "gsap";

/**
 * One hand-built transition per pair of neighbouring slides. `dir` is +1 when moving forward and -1 when
 * moving back, so every transition plays mirrored on the way back. Each returns a paused-free timeline;
 * the controller clears the inline styles afterwards.
 */
export interface Transition {
  (from: HTMLElement, to: HTMLElement, dir: 1 | -1): gsap.core.Timeline;
}

const EASE = "power3.inOut";
const kids = (el: HTMLElement, selector: string) => [...el.querySelectorAll<HTMLElement>(selector)];

/** Intro <-> About: a sideways push; the outgoing slide drifts at a third of the speed for depth. */
const push: Transition = (from, to, dir) =>
  gsap
    .timeline({ defaults: { ease: EASE, duration: 0.95 } })
    .fromTo(to, { xPercent: 100 * dir }, { xPercent: 0 }, 0)
    .to(from, { xPercent: -34 * dir, opacity: 0.2 }, 0)
    .fromTo(kids(to, "h2, .lead"), { x: 80 * dir, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.08, duration: 0.8 }, 0.3)
    .fromTo(
      kids(to, ".about-tiles li"),
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: "power3.out" },
      0.9,
    );

/** About <-> Skills: slide across, then the skill rows fly in one after another. */
const rows: Transition = (from, to, dir) =>
  gsap
    .timeline({ defaults: { ease: EASE, duration: 0.9 } })
    .fromTo(to, { xPercent: 100 * dir }, { xPercent: 0 }, 0)
    .to(from, { xPercent: -100 * dir, opacity: 0.4 }, 0)
    .fromTo(
      kids(to, ".skill-row"),
      { x: 140 * dir, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.07, duration: 0.8, ease: "power3.out" },
      0.35,
    );

/** Skills <-> Projects: a circular wipe opens from the centre while the old slide recedes. */
const wipe: Transition = (from, to) =>
  gsap
    .timeline({ defaults: { ease: "power2.inOut", duration: 1 } })
    .fromTo(to, { clipPath: "circle(0% at 50% 55%)" }, { clipPath: "circle(78% at 50% 55%)" }, 0)
    .to(from, { scale: 0.92, opacity: 0.3 }, 0)
    .fromTo(
      kids(to, ".projects-grid, .project-pager"),
      { scale: 1.12, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" },
      0.35,
    );

/** Projects <-> Journey: a sideways push, then the timeline entries step in from the edge. */
const journey: Transition = (from, to, dir) =>
  gsap
    .timeline({ defaults: { ease: EASE, duration: 0.9 } })
    .fromTo(to, { xPercent: 100 * dir }, { xPercent: 0 }, 0)
    .to(from, { xPercent: -60 * dir, opacity: 0.25 }, 0)
    .fromTo(
      kids(to, ".timeline-item"),
      { x: 90 * dir, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.09, duration: 0.7, ease: "power3.out" },
      0.4,
    );

/** Journey <-> Contact: a slow zoom through, ending on the call to action. */
const zoom: Transition = (from, to, dir) =>
  gsap
    .timeline({ defaults: { duration: 1, ease: "power2.inOut" } })
    .fromTo(to, { scale: dir > 0 ? 1.14 : 0.86, opacity: 0 }, { scale: 1, opacity: 1 }, 0.1)
    .to(from, { scale: dir > 0 ? 0.88 : 1.12, opacity: 0 }, 0)
    .fromTo(
      kids(to, "h2, .lead, .contact-actions, .contact-form > *"),
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: "power3.out" },
      0.55,
    );

/** Transition between slide `i` and `i + 1`. */
export const transitions: Transition[] = [push, rows, wipe, journey, zoom];

/** About text: the words light up once the slide has arrived. */
export function lightWords(words: HTMLElement[], delay: number): gsap.core.Tween {
  return gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, ease: "none", stagger: 0.035, duration: 0.5, delay });
}

/** Swap the visible project card with a directional slide and a wipe on the screenshot. */
export function swapProject(out: HTMLElement, into: HTMLElement, dir: 1 | -1): gsap.core.Timeline {
  const mockup = into.querySelector<HTMLElement>(".mockup");
  const copy = kids(into, ".project-details > *");
  return gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .to(out, { x: -70 * dir, opacity: 0, duration: 0.35, ease: "power2.in" }, 0)
    .fromTo(into, { x: 90 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.25)
    .fromTo(
      mockup,
      { clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0 0 0)", duration: 0.8, ease: "power3.inOut" },
      0.25,
    )
    .fromTo(copy, { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.5 }, 0.45);
}
