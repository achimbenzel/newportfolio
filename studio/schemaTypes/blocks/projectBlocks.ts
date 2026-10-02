import { defineField, defineType } from "sanity";

/**
 * Inhaltsblöcke für Projektseiten. Neuer Blocktyp → auch in der Website ergänzen:
 * web/app/lib/sanity/queries.ts, content/projects.server.ts, components/project/ProjectBlocks.tsx
 */
export const imageBlock = defineType({
  name: "imageBlock",
  title: "Bild (volle Breite)",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Bild",
      type: "imageWithAlt",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "caption", title: "Bildunterschrift", type: "localeString" }),
  ],
  preview: {
    select: { media: "image", title: "caption.de" },
    prepare: ({ media, title }) => ({ media, title: title || "Bild" }),
  },
});

export const imageGrid = defineType({
  name: "imageGrid",
  title: "Bildraster (2 Spalten)",
  type: "object",
  fields: [
    defineField({
      name: "images",
      title: "Bilder",
      type: "array",
      of: [{ type: "imageWithAlt" }],
      validation: (rule) => rule.min(2),
    }),
  ],
  preview: {
    select: { media: "images.0", count: "images.length" },
    prepare: ({ media }) => ({ media, title: "Bildraster" }),
  },
});

export const textBlock = defineType({
  name: "textBlock",
  title: "Textabschnitt",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Überschrift", type: "localeString" }),
    defineField({
      name: "body",
      title: "Text",
      description: "Absätze durch eine Leerzeile trennen.",
      type: "localeText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "align",
      title: "Ausrichtung",
      type: "string",
      options: {
        list: [
          { title: "Zweispaltig (Überschrift links)", value: "left" },
          { title: "Zentriert", value: "center" },
        ],
        layout: "radio",
      },
      initialValue: "left",
    }),
  ],
  preview: { select: { title: "heading.de", subtitle: "body.de" } },
});

export const videoEmbed = defineType({
  name: "videoEmbed",
  title: "Video (Vimeo/YouTube)",
  description: "Wird erst nach Zustimmung des Besuchers geladen (Consent).",
  type: "object",
  fields: [
    defineField({
      name: "provider",
      title: "Anbieter",
      type: "string",
      options: { list: ["vimeo", "youtube"], layout: "radio" },
      initialValue: "vimeo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "videoId",
      title: "Video-ID",
      description: "Nur die ID, z. B. 123456789 (Vimeo) oder dQw4w9WgXcQ (YouTube).",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Titel (für Screenreader)",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "title.de", subtitle: "provider" } },
});
