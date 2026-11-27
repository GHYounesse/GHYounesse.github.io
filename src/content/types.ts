import type { SkillId } from "./shared";

export interface Content {
  lang: "en" | "fr";
  meta: { title: string; description: string };
  nav: { contact: string; skip: string; home: string; slides: string; scrollView: string; slideView: string };
  hero: { greeting: string; name: string; titles: string[]; ui: string; between: string; api: string; cta: string };
  about: { title: string; text: string; tiles: { title: string; text: string }[] };
  skills: { title: string; text: string; labels: Record<SkillId, string>; languages: string[] };
  projects: {
    title: string;
    text: string;
    cta: string;
    prev: string;
    next: string;
    items: { id: string; name: string; desc: string }[];
  };
  timeline: { title: string; items: string[] };
  contact: {
    title: string;
    text: string;
    button: string;
    form: { name: string; email: string; message: string; send: string; sending: string; sent: string; error: string };
  };
}
