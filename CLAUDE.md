# Hinweise für KI-Assistenten

Portfolio-Website von Achim Benzel. Monorepo: `web/` (React Router 8 + Vite, vorgerendert),
`studio/` (Sanity Studio), `docs/` (Doku), `deploy/` (nginx/Docker).

**Vor jeder Änderung `docs/02-regeln.md` lesen und einhalten.** Kurzfassung:

- Routen dünn halten; Inhalte nur über `web/app/content/*.server.ts`; Sanity nur in `web/app/lib/sanity/*.server.ts`.
- Interne URLs nur über `web/app/lib/paths.ts`; neue Seite = `routes.ts` + `content/pages.server.ts` + `lib/paths.ts`.
- Styling: CSS Modules + Tokens aus `web/app/styles/tokens.css`, keine Hex-Werte in Komponenten, nur Dark Mode.
- Jeder sichtbare Text auf DE **und** EN (`web/app/i18n/de.ts`/`en.ts` bzw. zweisprachige Sanity-Felder).
- Jede Seite: `meta` mit `pageMeta()`, genau eine `<h1>`, Inhalte im vorgerenderten HTML.
- Barrierefreiheit ist ein freiwilliges Ziel (Orientierung WCAG 2.2 AA): Tastatur, Fokus, Kontrast, Alt-Texte, reduzierte Bewegung möglichst beachten (`docs/11-barrierefreiheit.md`).
- Datenschutz: keine Requests an Drittanbieter ohne Consent (Fonts/Bilder lokal, Embeds nur via `<ConsentGate>`).
- Keine fremden Code-Schnipsel/Assets ohne passende Lizenz; neue npm-Pakete in `docs/07-lizenzen.md` eintragen.
- Code Englisch, Kommentare & Doku Deutsch.
- Ask-Widget „Frag Achim“: **Neues Wissen auf der Website → auch in den Chat** (DE + EN), siehe Skill
  `frag-achim-wissen` und `docs/09-ask-widget.md`. Feste Fakten in `web/app/features/ask/knowledge.ts`
  (mit Beispielfragen), CMS-Inhalte automatisch über `content/ask.server.ts` → `features/ask/content.ts`.
- Vor dem Commit: `npm run check` (Format, Lint, Typen, Tests, Build).
