import { defineField, defineType } from "sanity";

/**
 * Globale Website-Einstellungen (Singleton – es gibt genau ein Dokument).
 * ⚠️ Vorbereitet, aber noch nicht in der Website angebunden (siehe docs/08-roadmap.md).
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Website-Einstellungen",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Kontakt-E-Mail",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "socials",
      title: "Social-Profile",
      type: "array",
      of: [
        {
          type: "object",
          name: "social",
          fields: [
            defineField({
              name: "label",
              title: "Name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "ogImage",
      title: "Standard-Vorschaubild (Social Media)",
      description: "1200 × 630 px. Wird verwendet, wenn eine Seite kein eigenes Bild hat.",
      type: "imageWithAlt",
    }),
  ],
  preview: { prepare: () => ({ title: "Website-Einstellungen" }) },
});
