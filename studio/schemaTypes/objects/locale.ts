import { defineField, defineType } from "sanity";

/**
 * Zweisprachige Felder. REGEL: Jeder Text, den Besucher sehen, ist eines dieser
 * Felder – nie ein einfacher string. Deutsch ist Pflicht, Englisch empfohlen
 * (fehlt Englisch, zeigt die Website automatisch den deutschen Text).
 */
const languages = [
  { id: "de", title: "Deutsch", required: true },
  { id: "en", title: "English", required: false },
] as const;

export const localeString = defineType({
  name: "localeString",
  title: "Text (DE/EN)",
  type: "object",
  fields: languages.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: "string",
      validation: (rule) => (lang.required ? rule.required() : rule.warning()),
    }),
  ),
});

export const localeText = defineType({
  name: "localeText",
  title: "Langtext (DE/EN)",
  type: "object",
  fields: languages.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: "text",
      rows: 5,
      validation: (rule) => (lang.required ? rule.required() : rule.warning()),
    }),
  ),
});
