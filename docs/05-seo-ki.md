# 05 – SEO & KI-Auffindbarkeit

## Das Wichtigste: echtes HTML

Jede Seite wird beim Build als **fertiges HTML** erzeugt. Google, Bing, ChatGPT, Perplexity & Co.
sehen sofort Überschriften, Texte, Links und Meta-Tags – ohne JavaScript ausführen zu müssen.

Prüfen: `npm run build`, dann z. B. `web/build/client/de/index.html` öffnen – der Inhalt steht im HTML.

## Was jede Seite automatisch bekommt (`pageMeta()` in `web/app/lib/seo.ts`)

- `<title>` im Format „Seitentitel – Achim Benzel“ (Startseite: eigener Titel)
- `<meta name="description">`
- `<link rel="canonical">` (absolute URL, ohne Slash am Ende – außer Startseite `/de/`)
- `hreflang`-Alternativen für `de`, `en` und `x-default` (→ Deutsch)
- Open Graph & Twitter Card (Titel, Beschreibung, URL, Sprache, Bild sobald vorhanden)
- optional `noindex` (z. B. Impressum, Datenschutz, 404)
- strukturierte Daten (JSON-LD)

## Strukturierte Daten (schema.org)

| Seite        | Typen                                                |
| ------------ | ---------------------------------------------------- |
| Startseite   | `Person`, `WebSite`                                  |
| Über mich    | `Person`                                             |
| Projektseite | `CreativeWork` (Ersteller: Person), `BreadcrumbList` |

Helfer: `personJsonLd`, `websiteJsonLd`, `creativeWorkJsonLd`, `breadcrumbJsonLd`.

## Generierte Dateien

| Datei          | Inhalt                                                         | Quelle                  |
| -------------- | -------------------------------------------------------------- | ----------------------- |
| `/sitemap.xml` | alle indexierbaren Seiten beider Sprachen inkl. hreflang       | `routes/sitemap.xml.ts` |
| `/robots.txt`  | erlaubt alle Crawler, verweist auf die Sitemap                 | `routes/robots.txt.ts`  |
| `/llms.txt`    | kompakte Markdown-Zusammenfassung für KI-Assistenten (DE + EN) | `routes/llms.txt.ts`    |

Alle drei entstehen aus **denselben Daten** wie die Seiten – neue Projekte erscheinen automatisch.

### KI-Training ausschließen?

Aktuell sind alle Crawler erlaubt (Ziel: in KI-Antworten auftauchen). Wer Inhalte nicht für
KI-_Training_ freigeben will, ergänzt in `routes/robots.txt.ts` z. B.:

```
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /
```

(Such-/Antwort-Crawler wie `OAI-SearchBot` oder `PerplexityBot` dabei erlaubt lassen.)

## Checkliste für jede neue Seite

- [ ] `meta` exportiert und `pageMeta({ locale, path, title, description })` genutzt
- [ ] genau eine `<h1>`, danach `<h2>`/`<h3>` in logischer Reihenfolge
- [ ] Seite in `content/pages.server.ts` eingetragen (sonst kein HTML, keine Sitemap)
- [ ] Bilder mit Alternativtext, `width`/`height` gesetzt (kein Layout-Springen)
- [ ] Inhalte stehen im vorgerenderten HTML (nicht erst nach Klick/Scroll per JS)
- [ ] interne Links mit `<Link>` + `paths.*`, beschreibende Linktexte

## Performance (wirkt direkt auf SEO)

- Kein Render-Blocking durch Fremd-Ressourcen (alles lokal).
- Schrift wird vorgeladen, `font-display: swap`.
- Bilder: WebP, `srcset` in mehreren Breiten, `loading="lazy"` außer im sichtbaren Bereich.
- Animationen sind CSS (kein schweres JS); der Hero-Effekt reagiert per CSS-Variable statt React-Render.
