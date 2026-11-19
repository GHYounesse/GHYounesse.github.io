import type { ImageMetadata } from "astro";
import leaksight from "../assets/leaksight.png";
import bugtracker from "../assets/bugtracker.png";
import baskit from "../assets/baskit.png";
import { SITE } from "../config";

/** Language-independent data. Text that needs translating lives in en.ts / fr.ts. */

export const skillGroups = [
  {
    id: "backend",
    items: [
      "PHP", "Laravel", "Symfony", "API Platform", "Java", "Spring Boot", "Spring Security", "Spring Cloud",
      "Hibernate / JPA", "NestJS", "Prisma", "Python", "FastAPI", "Doctrine ORM", "REST APIs", "JWT", "RBAC", "Maven",
    ],
  },
  {
    id: "frontend",
    items: ["React", "Inertia.js", "Angular", "TypeScript", "RxJS", "JavaScript", "Tailwind CSS", "Bootstrap", "HTML5", "CSS3"],
  },
  { id: "databases", items: ["PostgreSQL", "MySQL", "SQL", "MongoDB", "Redis"] },
  {
    id: "devops",
    items: ["Docker", "Git", "GitHub", "GitHub Actions (CI/CD)", "Flyway", "Postman", "JUnit", "Mockito", "Pest", "PHPUnit", "Playwright", "Jira"],
  },
  { id: "ai", items: ["LLM APIs (OpenRouter, Groq)", "AssemblyAI", "Claude Code", "Codex"] },
  // Spoken languages are translated, so their items live in en.ts / fr.ts.
  { id: "languages", items: [] },
] as const;

export type SkillId = (typeof skillGroups)[number]["id"];

interface ProjectMeta {
  /** Screenshot. Leave undefined to render a typographic placeholder tile instead. */
  image?: ImageMetadata;
  href: string;
  stack: string[];
}

// TODO(repo links): Hubly, Mentora, ShopSense, ledgerline and Baskit point at the GitHub profile
// until their repository URLs are added here.
export const projectMeta: Record<string, ProjectMeta> = {
  leaksight: {
    image: leaksight,
    href: "https://github.com/GHYounesse/LeakSight-Backend",
    stack: ["FastAPI", "MongoDB", "Redis", "Angular", "WebSocket", "Docker"],
  },
  baskit: {
    image: baskit,
    href: "https://github.com/GHYounesse/baskit",
    stack: ["Laravel", "React", "Inertia.js", "Stripe"],
  },
  hubly: {
    href: "https://github.com/GHYounesse/Hubly",
    stack: ["Symfony", "PostgreSQL", "Docker", "Tailwind"],
  },
  bugtracker: {
    image: bugtracker,
    href: "https://github.com/GHYounesse/BugTracker",
    stack: ["Symfony", "PostgreSQL", "API Platform", "Docker"],
  },
  shopsense: {
    href: "https://github.com/GHYounesse/shopsense",
    stack: ["Java", "Spring Boot", "PostgreSQL", "Redis", "Stripe"],
  },
  mentora: {
    href: "https://github.com/GHYounesse/mentora",
    stack: ["Angular", "Spring Boot", "PostgreSQL", "JWT"],
  },
  ledgerline: {
    href: "https://github.com/GHYounesse/ledgerline",
    stack: ["Java", "Spring Boot", "Spring Cloud", "Redis", "Docker"],
  },
};

export const timelinePeriods = [
  "Jan 2026 - Oct 2026",
  "2024 - 2026",
  "Jul 2025 - Sep 2025",
  "Oct 2024 - May 2025",
  "2022 - 2023",
  "2020 - 2022",
];
