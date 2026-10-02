import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Eigene Test-Konfiguration ohne React-Router-Plugin (das ist nur für Dev/Build gedacht).
export default defineConfig({
  resolve: {
    alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) },
  },
  test: {
    include: ["app/**/*.test.ts"],
    environment: "node",
  },
});
