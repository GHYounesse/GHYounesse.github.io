import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://younesghalloum.dev",
  trailingSlash: "always",
  build: { format: "directory" },
});
