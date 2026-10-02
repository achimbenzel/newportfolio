import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { serviceSlugs } from "./config/services";

/**
 * Routen-Übersicht der Website. URL-Schema: /:lang/… (de | en).
 * Routen-Dateien in ./routes bleiben „dünn“: Daten laden (loader), Meta-Tags (meta)
 * und Komponenten zusammensetzen – die eigentliche UI liegt in ./components & ./features.
 *
 * Neue Seite → Route hier + Pfad in content/pages.server.ts + Link in lib/paths.ts
 */
export default [
  // "/" → leitet auf die Standardsprache weiter
  index("routes/root-redirect.tsx"),

  // Generierte Dateien für Suchmaschinen & KI
  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("robots.txt", "routes/robots.txt.ts"),
  route("llms.txt", "routes/llms.txt.ts"),

  // Alle Seiten mit Sprachpräfix – gemeinsames Layout (Header, Footer)
  route(":lang", "routes/locale-layout.tsx", [
    index("routes/home.tsx"),
    route("work", "routes/work.tsx"),
    route("work/:slug", "routes/project.tsx"),
    ...serviceSlugs.map((slug) => route(slug, "routes/service.tsx", { id: `service-${slug}` })),
    route("about", "routes/about.tsx"),
    route("contact", "routes/contact.tsx"),
    route("imprint", "routes/legal.tsx", { id: "imprint" }),
    route("privacy", "routes/legal.tsx", { id: "privacy" }),
    route("*", "routes/not-found.tsx"),
  ]),
] satisfies RouteConfig;
