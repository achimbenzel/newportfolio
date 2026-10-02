import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Projekt (Portfolio-Eintrag). ⚠️ Entwurf v0 – Felder werden mit den echten Inhalten finalisiert.
 * Abgeleitet aus der alten project.json-Struktur.
 */
export const project = defineType({
  name: "project",
  title: "Projekt",
  type: "document",
  groups: [
    { name: "content", title: "Inhalt", default: true },
    { name: "meta", title: "Eckdaten" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "localeString",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL-Slug",
      description: "Teil der Adresse: /de/work/<slug>. Nach Veröffentlichung nicht mehr ändern!",
      type: "slug",
      group: "content",
      options: { source: "title.de", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cover",
      title: "Titelbild",
      description: "Erscheint in der Projektübersicht (4:3) und oben auf der Projektseite (16:9).",
      type: "imageWithAlt",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Beschreibung",
      type: "localeText",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "Inhaltsblöcke",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({ type: "imageBlock" }),
        defineArrayMember({ type: "imageGrid" }),
        defineArrayMember({ type: "textBlock" }),
        defineArrayMember({ type: "videoEmbed" }),
      ],
    }),
    defineField({
      name: "category",
      title: "Kategorie",
      type: "localeString",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Jahr",
      type: "number",
      group: "meta",
      validation: (rule) => rule.required().integer().min(2010).max(2100),
    }),
    defineField({ name: "client", title: "Kunde", type: "string", group: "meta" }),
    defineField({ name: "scope", title: "Umfang", type: "localeString", group: "meta" }),
    defineField({ name: "industry", title: "Branche", type: "localeString", group: "meta" }),
    defineField({
      name: "software",
      title: "Software",
      type: "array",
      group: "meta",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "color",
      title: "Projektfarbe",
      description: "Hex-Wert, z. B. #34505c – Hintergrund, solange Bilder laden.",
      type: "string",
      group: "meta",
      validation: (rule) => rule.regex(/^#[0-9a-fA-F]{6}$/, { name: "Hex-Farbe" }),
    }),
    defineField({
      name: "featured",
      title: "Auf der Startseite zeigen",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "sortOrder",
      title: "Reihenfolge",
      description: "Kleinere Zahl = weiter vorne. Leer = nach Jahr sortiert.",
      type: "number",
      group: "meta",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "sortOrder", by: [{ field: "sortOrder", direction: "asc" }] },
    {
      title: "Jahr (neueste zuerst)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title.de", subtitle: "category.de", year: "year", media: "cover" },
    prepare: ({ title, subtitle, year, media }) => ({
      title,
      subtitle: [subtitle, year].filter(Boolean).join(" · "),
      media,
    }),
  },
});
