import type { StructureResolver } from "sanity/structure";

/** Seitenleiste im Studio: Einstellungen oben (Singleton), darunter Inhalte. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Inhalte")
    .items([
      S.listItem()
        .title("Website-Einstellungen")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      S.documentTypeListItem("project").title("Projekte"),
      S.documentTypeListItem("service").title("Leistungen"),
    ]);
