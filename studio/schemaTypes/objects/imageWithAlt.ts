import { defineField, defineType } from "sanity";

/** Bild mit Pflicht-Alternativtext (Barrierefreiheit & SEO). */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Bild",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternativtext",
      description: "Beschreibt, was auf dem Bild zu sehen ist (für Screenreader & Suchmaschinen).",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
  ],
});
