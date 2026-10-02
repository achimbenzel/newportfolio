# 07 – Lizenzen & Herkunft („nichts geklaut“)

Ziel: Für jede Datei im Projekt ist klar, **woher sie kommt und unter welcher Lizenz sie steht**.

## Eigener Code

- Der gesamte Code in `web/app`, `studio/`, `deploy/` wurde **für dieses Projekt neu geschrieben** –
  kein Template, kein Theme, keine kopierten Code-Schnipsel fremder Websites.
- Aus der alten Website (eigenes Repo `achimbenzel/portfoliowebsite`) wurden nur **eigene**
  Werte übernommen: Farbwerte, Schriftwahl, die Idee der schwebenden Navigation, Logo-SVGs, Texte.
- Das „Frag Achim“-Widget basiert auf dem eigenen Entwurf `ask-achim-widget-v2.html`
  (Logik & Texte), neu als React-Komponente umgesetzt.
- Icons (`components/ui/Icon.tsx`), Noise-Texturen und der Pseudo-3D-Effekt sind selbst gezeichnet/geschrieben.

## Marke & Assets

| Asset                      | Herkunft                          | Rechte       |
| -------------------------- | --------------------------------- | ------------ |
| Logo (Bild- & Wortmarke)   | eigene SVGs aus der alten Website | Achim Benzel |
| Favicon                    | aus der eigenen Bildmarke         | Achim Benzel |
| Projekttexte (Platzhalter) | aus den eigenen `project.json`    | Achim Benzel |
| Fotos (z. B. Japan 2024)   | eigene Fotos (`assets/photos/`)   | Achim Benzel |

Software-Namen (z. B. „Adobe Illustrator“) werden nur als **Text** genannt – keine fremden Logos/Icons
eingebunden. Wenn später Programm-Icons gezeigt werden sollen: nur offizielle, zur Nutzung
freigegebene Grafiken und deren Markenrichtlinien beachten.

## Schriften

| Schrift        | Lizenz                    | Quelle                        | Lizenztext                                |
| -------------- | ------------------------- | ----------------------------- | ----------------------------------------- |
| DM Sans        | SIL Open Font License 1.1 | Google Fonts / Fontsource 5.3 | `web/public/fonts/dm-sans/OFL.txt`        |
| JetBrains Mono | SIL Open Font License 1.1 | Google Fonts / Fontsource 5.3 | `web/public/fonts/jetbrains-mono/OFL.txt` |

Die OFL erlaubt Nutzung, Einbettung und Selbst-Hosting (auch kommerziell). Die Lizenztexte müssen
bei den Dateien bleiben – deshalb liegen sie im selben Ordner und werden mit ausgeliefert.

## Abhängigkeiten, die beim Besucher ankommen (Browser-Bundle)

| Paket                                                | Lizenz |
| ---------------------------------------------------- | ------ |
| `react`, `react-dom`                                 | MIT    |
| `react-router`                                       | MIT    |
| `scheduler`, `cookie-es`, `@remix-run/route-pattern` | MIT    |

## Abhängigkeiten nur für Entwicklung/Build (nicht beim Besucher)

| Paket                                                    | Lizenz     |
| -------------------------------------------------------- | ---------- |
| `@react-router/dev`, `vite`                              | MIT        |
| `@sanity/client`, `@sanity/image-url`                    | MIT        |
| `sanity`, `@sanity/vision`, `styled-components` (Studio) | MIT        |
| `typescript`                                             | Apache-2.0 |
| `eslint`, `typescript-eslint`, `prettier`, Plugins       | MIT        |
| `vitest` (Tests)                                         | MIT        |
| `sharp` (Bildaufbereitung `npm run photos`, nur lokal)   | Apache-2.0 |

Im gesamten Abhängigkeitsbaum stehen nur freizügige Lizenzen (MIT, ISC, BSD, Apache-2.0, BlueOak,
CC0) sowie einige MPL-2.0-Werkzeuge (z. B. `lightningcss` im Build) – unverändert genutzt, das ist
unproblematisch. **Keine GPL/AGPL.**

Prüfen (z. B. vor einem Release):

```bash
npx license-checker --summary        # Übersicht aller Lizenzen
```

## Regeln für Neues

1. **npm-Paket:** Lizenz auf npmjs.com prüfen. Erlaubt: MIT, ISC, BSD, Apache-2.0, 0BSD, CC0, BlueOak.
   MPL-2.0 nur für Build-Werkzeuge. **Nicht**: GPL, AGPL, „Non-Commercial“, unbekannt. Eintrag hier ergänzen.
2. **Code aus dem Internet / Tutorials / KI:** nur die Idee übernehmen und selbst schreiben. Bei
   größeren Übernahmen Lizenz prüfen und Quelle im Kommentar nennen.
3. **Bilder/Videos/Mockups:** nur eigene Werke oder Stock mit Lizenz für kommerzielle Website-Nutzung.
   Mockup-Vorlagen: Lizenzbedingungen (Namensnennung?) beachten und hier notieren.
4. **Schriften:** nur mit Webfont-Lizenz; Lizenzdatei neben die Schriftdatei legen.
