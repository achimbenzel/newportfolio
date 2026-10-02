# 10 – Anleitungen

## Neue Seite anlegen (Beispiel: `/de/fonts`)

1. **Route** in `web/app/routes.ts` innerhalb von `:lang` ergänzen:
   ```ts
   route("fonts", "routes/fonts.tsx"),
   ```
2. **Pfad-Helfer** in `web/app/lib/paths.ts`:
   ```ts
   fonts: (l: Locale) => `/${l}/fonts`,
   ```
3. **Seite für den Build registrieren** in `web/app/content/pages.server.ts`:
   ```ts
   { path: "/fonts", indexable: true },
   ```
4. **Routen-Datei** `web/app/routes/fonts.tsx`:
   ```tsx
   import { PageHeader } from "~/components/sections/PageHeader";
   import { getDictionary, useT } from "~/i18n";
   import { localeOr } from "~/lib/route";
   import { pageMeta } from "~/lib/seo";
   import type { Route } from "./+types/fonts";

   export function meta({ params }: Route.MetaArgs) {
     const locale = localeOr(params.lang);
     return pageMeta({ locale, path: "/fonts", title: getDictionary(locale).nav.fonts });
   }

   export default function Fonts() {
     const t = useT();
     return <PageHeader title={t.nav.fonts} />;
   }
   ```
5. **Texte** in `i18n/de.ts` **und** `i18n/en.ts` (z. B. `nav.fonts`).
6. Ggf. Link in Header/Footer ergänzen (`paths.fonts(locale)`).
7. **Wissen für den Chat?** Enthält die Seite Infos, nach denen Besucher fragen könnten, muss
   „Frag Achim“ sie auch kennen (DE + EN) – siehe
   [09-ask-widget.md → Wissen wächst automatisch](09-ask-widget.md#wissen-wächst-automatisch-mit-der-website).
8. `npm run check`.

Braucht die Seite Inhalte aus Sanity → zusätzlich `loader` + Funktion in `content/*.server.ts`.

## Neue Komponente

1. Passenden Ordner wählen (`ui/` generisch, `sections/` Seitenabschnitt, `project/` fachlich …).
2. `Name.tsx` + `Name.module.css` anlegen. Nur Tokens verwenden, Texte über `useT()`.
3. Daten als Props mit Typen aus `content/types.ts` – kein Datenladen in der Komponente.

## Neuer UI-Text

1. Schlüssel in `i18n/de.ts` ergänzen.
2. Denselben Schlüssel in `i18n/en.ts` – TypeScript meldet sonst einen Fehler.
3. In der Komponente: `const t = useT(); t.bereich.schluessel`.

## Neues Icon

In `components/ui/Icon.tsx` einen Eintrag im `icons`-Objekt ergänzen (24er-Raster, nur Linien,
`stroke` erbt die Textfarbe). Selbst zeichnen oder Quelle/Lizenz in [07-lizenzen.md](07-lizenzen.md) eintragen.

## Neuer Inhaltsblock für Projekte (z. B. „Zitat“)

1. Studio: Typ in `studio/schemaTypes/blocks/projectBlocks.ts` + in `project.ts` → `content.of` ergänzen.
2. GROQ: Projektion in `web/app/lib/sanity/queries.ts` (`projectQuery` → `content[]{…}`).
3. Typ: `ProjectBlock` in `web/app/content/types.ts`.
4. Mapping: `toBlock()` in `web/app/content/projects.server.ts`.
5. Darstellung: `components/project/ProjectBlocks.tsx` (+ CSS).
6. Enthält der Block Wissen für den Chat (z. B. Zitat eines Kunden)? → `content/ask.server.ts` +
   `features/ask/content.ts` (siehe [09-ask-widget.md](09-ask-widget.md)).

## Fotos für den Chat

Beispiel: die Japan-Galerie („Möchtest du ein paar Bilder sehen?“).

1. Originale nach `assets/photos/<album>/originals/` legen, Dateiname = Reihenfolge + Motiv
   (z. B. `10-fuji.jpg`). Die Originale werden **nicht** ausgeliefert.
2. `npm run photos` → erzeugt `web/public/images/<album>/<name>-480.webp` (Vorschau) und
   `-1600.webp` (Vergrößerung), dreht Handyfotos richtig und **entfernt alle Metadaten**
   (GPS-Standort, Kamera …). Außerdem `web/app/features/ask/photos.generated.ts`.
3. In `web/app/features/ask/galleries.ts` für jedes neue Bild einen Alternativtext auf **Deutsch und
   Englisch** eintragen (`npm test` meldet fehlende).
4. Neues Album? → in `galleries` eintragen und an ein Thema hängen (`gallery: "…"` in
   `knowledge.ts`, ggf. mit `offer` für die Ja/Nein-Frage).

## Neue Consent-Kategorie

Siehe [06-datenschutz.md → Neuen Dienst hinzufügen](06-datenschutz.md#neuen-dienst-hinzufügen-z-b-statistik).

## Lokaler Produktionstest

```bash
npm run build && npm run preview   # → http://localhost:4173/de/
```

`preview` verhält sich wie der nginx-Server (Weiterleitung `/` → `/de/`, 404 mit gestalteter Seite).
