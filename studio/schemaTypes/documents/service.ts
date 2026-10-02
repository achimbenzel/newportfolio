import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Leistungsseite. Die Slugs sind im Website-Code fest verdrahtet
 * (web/app/config/services.ts) – deshalb hier nur eine Auswahl statt freier Eingabe.
 */
export const service = defineType({
  name: "service",
  title: "Leistung",
  type: "document",
  fields: [
    defineField({
      name: "page",
      title: "Seite",
      description:
        "Für welche Leistungsseite gilt dieses Dokument? (Pro Seite nur EIN Dokument anlegen.)",
      type: "string",
      options: {
        list: [
          { title: "Brand & Logo Design (/branding)", value: "branding" },
          { title: "Motion Design (/motion-design)", value: "motion-design" },
          { title: "Music & Visuals (/music-visuals)", value: "music-visuals" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Titel",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Einleitung",
      type: "localeText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "process",
      title: "Ablauf (Schritte)",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({
              name: "title",
              title: "Schritt",
              type: "localeString",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "text", title: "Beschreibung", type: "localeText" }),
          ],
          preview: { select: { title: "title.de", subtitle: "text.de" } },
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { select: { title: "title.de", subtitle: "page" } },
});
