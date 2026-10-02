import { defineField, defineType } from "sanity";

/** Optionale SEO-Overrides. Leer lassen = Titel/Beschreibung des Dokuments werden verwendet. */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Seitentitel",
      description: "Max. ~60 Zeichen. „– Achim Benzel“ wird automatisch angehängt.",
      type: "localeString",
    }),
    defineField({
      name: "description",
      title: "Meta-Beschreibung",
      description: "Max. ~160 Zeichen – erscheint in Google & beim Teilen.",
      type: "localeText",
    }),
  ],
});
