import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  // Adresse beim Deploy: https://<studioHost>.sanity.studio
  studioHost: process.env.SANITY_STUDIO_HOST,
  typegen: {
    // Erzeugt TypeScript-Typen aus Schema + GROQ-Abfragen der Website
    path: "../web/app/**/*.{ts,tsx}",
    generates: "../web/app/lib/sanity/sanity.types.ts",
  },
});
