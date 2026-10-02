# 11 – Barrierefreiheit

**Die Website soll barrierefrei sein.** Ziel ist die Konformitätsstufe **WCAG 2.2 AA** – für jede
Seite, jede Komponente und jeden Inhalt aus Sanity. Barrierefreiheit ist kein späterer Feinschliff,
sondern gehört zur Definition von „fertig“.

> Rechtlicher Hinweis (keine Rechtsberatung): Das Barrierefreiheitsstärkungsgesetz (BFSG) sieht für
> Kleinstunternehmen Ausnahmen vor. Unabhängig davon gilt für dieses Projekt WCAG 2.2 AA als Standard –
> es verbessert außerdem SEO, mobile Bedienung und die Lesbarkeit für alle.

## Grundsätze

1. **Wahrnehmbar** – Texte haben genug Kontrast, Bilder einen Alternativtext, nichts wird nur über
   Farbe vermittelt, Inhalte bleiben bei 200 % Zoom und 320 px Breite vollständig nutzbar.
2. **Bedienbar** – alles funktioniert per Tastatur, der Fokus ist immer sichtbar, Animationen
   respektieren „Bewegung reduzieren“, nichts blinkt oder läuft unkontrollierbar.
3. **Verständlich** – Sprache ist ausgezeichnet (`<html lang>`), Navigation ist auf allen Seiten gleich,
   Formulare haben Beschriftungen und verständliche Fehlermeldungen.
4. **Robust** – semantisches HTML zuerst, ARIA nur wo nötig; Inhalte stehen im vorgerenderten HTML.

## Was bereits umgesetzt ist

| Bereich           | Umsetzung                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Struktur          | `header`/`nav`/`main`/`footer`, genau eine `<h1>` pro Seite, logische Überschriften-Reihenfolge                                                                 |
| Sprache           | `<html lang>` folgt der URL (de/en); Sprachlinks mit `hreflang`/`lang` und ausgeschriebenem Namen                                                               |
| Tastatur          | Skip-Link „Zum Inhalt springen“, Header-Menü & Leistungen-Panel per Tastatur, `Esc` schließt                                                                    |
| Fokus             | sichtbarer Fokusrahmen (`:focus-visible`) in `--color-accent-text`                                                                                              |
| Kontrast          | Text-Tokens ≥ 4.5 : 1 auf dem Hintergrund (Werte in [03-design-system.md](03-design-system.md))                                                                 |
| Bewegung          | `prefers-reduced-motion` schaltet Animationen global ab (`styles/base.css`)                                                                                     |
| Bilder            | Alternativtext ist in Sanity Pflicht (DE/EN); dekorative Grafiken mit `aria-hidden`                                                                             |
| Chat „Frag Achim“ | Eingabe beschriftet, Verlauf als `role="log"` mit `aria-live`, Tipp-Animation wird angesagt, Verlauf per Tastatur scrollbar (auch ohne sichtbaren Scrollbalken) |
| Cookie-Banner     | `role="dialog"`, Schalter als `role="switch"`, gleichwertige Buttons, Fokus beim Öffnen                                                                         |
| Externe Medien    | Platzhalter mit verständlichem Text und echten Buttons (`ConsentGate`)                                                                                          |

## Regeln für neue Komponenten

- [ ] Native Elemente verwenden: `<button>` für Aktionen, `<a>`/`<Link>` für Navigation, `<label>` für Felder.
- [ ] Jeder interaktive Bereich ist per `Tab` erreichbar und per `Enter`/`Leertaste` bedienbar.
- [ ] Icon-only-Buttons haben ein `aria-label`; rein dekorative SVGs `aria-hidden="true"`.
- [ ] Aufklappbare Elemente: `aria-expanded` + `aria-controls`; geschlossene Bereiche `inert`.
- [ ] Neue Farben nur über Tokens, Kontrast prüfen (Text ≥ 4.5 : 1, große Schrift/Icons ≥ 3 : 1).
- [ ] Zustände nie nur über Farbe zeigen (z. B. aktive Sprache: Farbe **und** `aria-current`).
- [ ] Neue Animationen: nichts Wichtiges nur in Bewegung zeigen; „Bewegung reduzieren“ testen.
- [ ] Scrollbare Bereiche ohne sichtbaren Balken bekommen `tabIndex={0}` und einen Namen.
- [ ] Texte für Screenreader (z. B. `sr-only`) gibt es ebenfalls auf DE **und** EN.

## Regeln für Inhalte (Sanity)

- Alternativtexte beschreiben, was zu sehen ist und warum es wichtig ist – nicht „Bild von …“.
- Überschriften in Textblöcken nicht zur Optik missbrauchen.
- Linktexte sind aussagekräftig („Zum Projekt Gute Stube“ statt „hier“).
- Videos: wenn gesprochen wird, Untertitel bereitstellen.

## Testen (vor jedem Release)

1. **Nur Tastatur:** Seite mit `Tab`/`Shift+Tab`/`Enter`/`Esc` komplett bedienen – Fokus immer sichtbar?
2. **Screenreader:** NVDA (Windows) oder VoiceOver (macOS/iOS) – Überschriften, Links, Chat, Banner.
3. **Automatisch:** Lighthouse „Barrierefreiheit“ bzw. axe DevTools – Ziel: keine Fehler.
4. **Zoom & schmal:** 200 % Zoom und 320 px Breite – nichts abgeschnitten, kein seitliches Scrollen.
5. **Bewegung reduzieren** im Betriebssystem einschalten – keine störenden Animationen mehr.

## Offen

- Automatischer Barrierefreiheits-Test (z. B. axe mit Playwright) in `npm run check`
- Optional: Seite „Erklärung zur Barrierefreiheit“ mit Kontaktmöglichkeit für Barrieren
