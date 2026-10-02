import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, singletonTypes } from "./schemaTypes";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "missing-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "Achim Benzel – Portfolio",
  projectId,
  dataset,
  plugins: [
    structureTool({ structure }),
    // GROQ-Abfragen direkt im Studio testen (Tab „Vision“)
    visionTool({ defaultApiVersion: "2026-10-01" }),
  ],
  schema: {
    types: schemaTypes,
    // Singletons (z. B. Website-Einstellungen) nicht über „+ Neu“ anlegbar
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter(
            ({ action }) => action && ["publish", "discardChanges", "restore"].includes(action),
          )
        : actions,
  },
});
