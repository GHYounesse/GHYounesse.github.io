import { describe, expect, it } from "vitest";
import { hexToRgb, palettes, themeFromAttribute } from "../../src/scripts/shader-palette";

describe("hexToRgb", () => {
  it("converts to 0..1 floats", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#ffffff")).toEqual([1, 1, 1]);
    const [r, g, b] = hexToRgb("#ff6b35");
    expect(r).toBeCloseTo(1, 5);
    expect(g).toBeCloseTo(0x6b / 255, 5);
    expect(b).toBeCloseTo(0x35 / 255, 5);
  });

  it("is case-insensitive", () => {
    expect(hexToRgb("#FF6B35")).toEqual(hexToRgb("#ff6b35"));
  });

  it.each(["ff6b35", "#fff", "#gggggg", "", "#ff6b3500"])("rejects %j", (bad) => {
    expect(() => hexToRgb(bad)).toThrow(/#rrggbb/);
  });
});

describe("palettes", () => {
  const luminance = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  it("define valid colours and a strength in (0, 1] for both themes", () => {
    for (const [theme, palette] of Object.entries(palettes)) {
      for (const hex of [palette.bg, palette.a, palette.b]) expect(() => hexToRgb(hex), theme).not.toThrow();
      expect(palette.strength, theme).toBeGreaterThan(0);
      expect(palette.strength, theme).toBeLessThanOrEqual(1);
    }
  });

  it("keeps the dark background darker than the light one", () => {
    expect(luminance(palettes.dark.bg)).toBeLessThan(luminance(palettes.light.bg));
  });
});

describe("themeFromAttribute", () => {
  it("only treats an explicit 'light' as light", () => {
    expect(themeFromAttribute("light")).toBe("light");
    expect(themeFromAttribute("dark")).toBe("dark");
    expect(themeFromAttribute(null)).toBe("dark");
    expect(themeFromAttribute("sepia")).toBe("dark");
  });
});
