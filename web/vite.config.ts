import { fileURLToPath } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  css: {
    modules: {
      // Lesbare Klassennamen im Dev-Modus, kurze Hashes im Build.
      generateScopedName:
        process.env.NODE_ENV === "production" ? "[hash:base64:6]" : "[name]__[local]",
    },
  },
  server: {
    port: 5173,
  },
});
