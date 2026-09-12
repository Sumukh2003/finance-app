import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // These are pure-logic tests: no database, no network, no React. They run in
    // milliseconds, which is what makes them worth running on every save.
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
