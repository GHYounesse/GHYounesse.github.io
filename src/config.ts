/**
 * Visual mode of the whole site. Change this one value and rebuild.
 *
 *  - "cinematic": WebGL shader hero, smooth scroll, GSAP reveals, spotlight cards.
 *  - "editorial": quiet and typographic; ships no animation libraries.
 *  - "brutalist": loud neo-brutalism: thick borders, hard shadows, stickers, bouncy motion.
 *  - "terminal":  phosphor-green CRT shell: scanlines, boot log, glitch, `$` prompts.
 *
 * For one-off builds you can override it with the PUBLIC_DESIGN env var,
 * e.g. `PUBLIC_DESIGN=terminal npm run build`.
 */
export type DesignMode = "cinematic" | "editorial" | "brutalist" | "terminal";

const MODES: DesignMode[] = ["cinematic", "editorial", "brutalist", "terminal"];
const fromEnv = import.meta.env.PUBLIC_DESIGN as DesignMode | undefined;

export const DESIGN: DesignMode = fromEnv && MODES.includes(fromEnv) ? fromEnv : "cinematic";

export const SITE = {
  url: "https://younesghalloum.dev",
  email: "simplelogin-newsletter.festivity961@simplelogin.com",
  github: "https://github.com/GHYounesse",
  linkedin: "https://www.linkedin.com/in/younes-ghalloum",
  formEndpoint: "https://formspree.io/f/xwlpbvwk",
};
