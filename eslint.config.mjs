import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/",
      ".test-dist/",
      ".astro/",
      "node_modules/",
      "coverage/",
      "playwright-report/",
      "test-results/",
      ".lighthouseci/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  ...astro.configs["flat/jsx-a11y-recommended"],

  { files: ["src/**/*.{ts,astro}"], languageOptions: { globals: globals.browser } },
  {
    files: ["scripts/**", "mocks/**", "*.config.*", ".lighthouserc.cjs", "tests/integration/**"],
    languageOptions: { globals: globals.node },
  },
  { files: ["tests/**"], languageOptions: { globals: { ...globals.node, ...globals.browser } } },

  {
    rules: {
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrors: "none" }],
    },
  },
  // CLIs and the mock server print on purpose.
  { files: ["scripts/**", "mocks/**"], rules: { "no-console": "off" } },

  prettier,
];
