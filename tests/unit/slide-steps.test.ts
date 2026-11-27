import { describe, expect, it } from "vitest";
import { acceptWheel, nextMove, slideFromHash, type Layout } from "../../src/scripts/slide-steps";

const layout: Layout = { slides: 6, stepping: 3, items: 7 };

describe("nextMove", () => {
  it("moves to the next and previous slide", () => {
    expect(nextMove({ slide: 0, project: 0 }, 1, layout)).toEqual({ kind: "slide", to: { slide: 1, project: 0 } });
    expect(nextMove({ slide: 2, project: 0 }, -1, layout)).toEqual({ kind: "slide", to: { slide: 1, project: 0 } });
  });

  it("stops at both ends", () => {
    expect(nextMove({ slide: 0, project: 0 }, -1, layout)).toEqual({ kind: "none" });
    expect(nextMove({ slide: 5, project: 0 }, 1, layout)).toEqual({ kind: "none" });
  });

  it("steps through projects before leaving the projects slide", () => {
    expect(nextMove({ slide: 3, project: 2 }, 1, layout)).toEqual({ kind: "item", to: { slide: 3, project: 3 } });
    expect(nextMove({ slide: 3, project: 2 }, -1, layout)).toEqual({ kind: "item", to: { slide: 3, project: 1 } });
    expect(nextMove({ slide: 3, project: 6 }, 1, layout)).toEqual({ kind: "slide", to: { slide: 4, project: 6 } });
    expect(nextMove({ slide: 3, project: 0 }, -1, layout)).toEqual({ kind: "slide", to: { slide: 2, project: 0 } });
  });

  it("enters the projects at the first one going forward and the last one coming back", () => {
    expect(nextMove({ slide: 2, project: 0 }, 1, layout)).toEqual({ kind: "slide", to: { slide: 3, project: 0 } });
    expect(nextMove({ slide: 4, project: 0 }, -1, layout)).toEqual({ kind: "slide", to: { slide: 3, project: 6 } });
  });
});

describe("slideFromHash", () => {
  it("finds a slide by id and ignores unknown hashes", () => {
    const ids = ["top", "about", "skills"];
    expect(slideFromHash("#skills", ids)).toBe(2);
    expect(slideFromHash("#nope", ids)).toBe(-1);
    expect(slideFromHash("", ids)).toBe(-1);
  });
});

describe("acceptWheel", () => {
  it("needs a quiet gap and no running transition", () => {
    expect(acceptWheel(1000, 700, false)).toBe(true);
    expect(acceptWheel(1000, 900, false)).toBe(false);
    expect(acceptWheel(1000, 0, true)).toBe(false);
  });
});
