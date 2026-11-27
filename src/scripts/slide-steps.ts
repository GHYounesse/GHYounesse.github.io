/** DOM-free navigation rules for the slideshow: where a "next" or "previous" input should go. */

export interface Position {
  slide: number;
  /** Which project is showing; only meaningful on the projects slide. */
  project: number;
}

export interface Layout {
  slides: number;
  /** Index of the slide that steps through its own items (the projects). */
  stepping: number;
  items: number;
}

export type Move = { kind: "none" } | { kind: "item"; to: Position } | { kind: "slide"; to: Position };

/** One step forward (+1) or back (-1): through the projects first, then on to the neighbouring slide. */
export function nextMove(at: Position, dir: 1 | -1, layout: Layout): Move {
  if (at.slide === layout.stepping) {
    const project = at.project + dir;
    if (project >= 0 && project < layout.items) return { kind: "item", to: { slide: at.slide, project } };
  }
  const slide = at.slide + dir;
  if (slide < 0 || slide >= layout.slides) return { kind: "none" };
  // Arriving on the projects slide: first project when going forward, last when coming back.
  const project = slide === layout.stepping ? (dir > 0 ? 0 : layout.items - 1) : at.project;
  return { kind: "slide", to: { slide, project } };
}

/** Index of the slide whose id matches a location hash like "#skills", or -1. */
export function slideFromHash(hash: string, ids: string[]): number {
  return ids.indexOf(hash.replace(/^#/, ""));
}

/**
 * Wheel/trackpad gate. Trackpad inertia keeps firing events for about a second after a gesture, so a step is
 * only accepted when the input has been quiet for `quietMs` since the previous wheel event AND no transition runs.
 */
export function acceptWheel(now: number, lastEvent: number, busy: boolean, quietMs = 140): boolean {
  return !busy && now - lastEvent >= quietMs;
}
