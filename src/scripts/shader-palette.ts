/** Colour data and helpers for the cinematic hero shader. Kept free of WebGL so it can be unit-tested. */

export type Theme = "dark" | "light";
export type Palette = { bg: string; a: string; b: string; strength: number };

export const palettes: Record<Theme, Palette> = {
  dark: { bg: "#0a0b0f", a: "#ff6b35", b: "#4a3fd6", strength: 0.62 },
  light: { bg: "#efefec", a: "#ffb089", b: "#b8b2ff", strength: 0.75 },
};

/** "#rrggbb" to 0..1 floats, the format GLSL uniforms expect. */
export function hexToRgb(hex: string): [number, number, number] {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Expected a #rrggbb colour, got "${hex}"`);
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Anything that is not explicitly "light" is treated as dark (the default theme of this mode). */
export function themeFromAttribute(value: string | null): Theme {
  return value === "light" ? "light" : "dark";
}
