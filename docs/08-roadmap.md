# 08 – Roadmap / offene Punkte

Stand: Grundstruktur + optischer Prototyp. Die folgenden Punkte sind bewusst noch offen.

## Als Nächstes (laut Absprache)

- [ ] **Inhalte**: echte Texte für Leistungen, Über mich, Kontakt
- [ ] **Projekte anlegen**: Projekt-Schema in Sanity finalisieren (`studio/schemaTypes/documents/project.ts`),
      alte Projekte (Gute Stube, Joeys Picknick, Logos/LumaKeys …) übertragen
- [ ] **Umgebungsvariablen / Deployment**: Sanity-Projekt anlegen, `.env`-Dateien, Server & Domain,
      Docker-Setup (`deploy/`) auf dem Server einrichten
- [ ] **Kontaktformular**: Formular + Versand (eigener kleiner Endpoint oder deutscher Mail-Dienst),
      Spam-Schutz ohne Drittanbieter-Tracking, Datenschutzhinweis
- [ ] **Ask-Widget-Inhalte**: finale Informationen in `web/app/features/ask/knowledge.ts`
      (Projekte, Leistungsseiten und Social-Profile kommen schon automatisch aus dem Content-Layer)
- [ ] Ask-Widget: Wissenslücken schließen, die beim Testen auffielen – z. B. „Machst du Websites/
      Webdesign?“, „Machst du Social-Media-Content/Fotografie?“, „Wo wohnst du?“ (aktuell ehrliche
      „Weiß ich nicht → E-Mail“-Antwort)

## Technik

- [ ] **Automatischer Rebuild**: Sanity-Webhook → Build (z. B. GitHub Actions / Server-Skript) → Deploy
- [ ] `siteSettings` aus Sanity anbinden (E-Mail, Social-Links, Standard-Vorschaubild) – Social-Links
      dann auch in `getAskContent()` statt aus `config/site.ts`
- [ ] Social-/OG-Bild (1200 × 630) gestalten und einbinden (`site.defaultOgImage`)
- [ ] App-Icons als PNG (180 px Apple-Touch, 192/512 px) + `site.webmanifest`
- [ ] Projekttexte als Rich Text (Portable Text) statt Plain Text, falls Formatierung gebraucht wird
- [ ] Projektübersicht: Filter nach Kategorie (wie alte Seite)
- [ ] Seitenübergänge (View Transitions API) prüfen
- [ ] `Content-Security-Policy` im nginx (Vorschlag in [06-datenschutz.md](06-datenschutz.md))
- [ ] Sanity TypeGen nutzen (`npm run typegen -w studio`) für typsichere GROQ-Ergebnisse
- [ ] Optional: KI-Backend für das Ask-Widget (siehe [09-ask-widget.md](09-ask-widget.md))

## Vor dem Livegang (Pflicht)

- [ ] Impressum & Datenschutzerklärung (Platzhalter ersetzen!)
- [ ] Checkliste in [06-datenschutz.md](06-datenschutz.md) abarbeiten
- [ ] Alte URLs weiterleiten: `/de/services` → `/de/branding`?, `/de/my-fonts…` → ? (nginx `return 301`)
- [ ] Google Search Console: neue Sitemap einreichen
- [ ] Lighthouse/PageSpeed prüfen (Ziel: ≥ 95 in allen Kategorien)
