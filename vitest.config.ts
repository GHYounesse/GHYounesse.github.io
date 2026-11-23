import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"], environment: "node" },
      },
      // These two read the built sites in .test-dist (run `npm run build:test` first).
      {
        extends: true,
        test: { name: "security", include: ["tests/security/**/*.test.ts"], environment: "node" },
      },
      {
        extends: true,
        test: { name: "perf", include: ["tests/perf/**/*.test.ts"], environment: "node" },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/scripts/**", "src/content/**", "src/config.ts"],
      exclude: ["src/scripts/hero-shader.ts", "src/scripts/cinematic.ts"], // WebGL/GSAP: covered by the browser tests
      reporter: ["text", "html"],
    },
  },
});
