# 03 – Design-System

Alle Werte leben in [`web/app/styles/tokens.css`](../web/app/styles/tokens.css). Abgeleitet aus dem
CSS der alten Website (Farben, Schriften, Floating-Nav), aufgeräumt und auf **nur Dark Mode** reduziert.

## Farben

| Token                    | Wert      | Verwendung                                | Kontrast auf `--color-bg` |
| ------------------------ | --------- | ----------------------------------------- | ------------------------- |
| `--color-bg`             | `#111114` | Seitenhintergrund                         | –                         |
| `--color-bg-sunken`      | `#0c0c0e` | Footer, tiefe Flächen                     | –                         |
| `--color-surface`        | `#18181c` | Karten, Panels, offene Menüs              | –                         |
| `--color-surface-raised` | `#202024` | Hover, Inputs, Avatare                    | –                         |
| `--color-text`           | `#e8eaf0` | Haupttext                                 | 15.7 : 1                  |
| `--color-text-muted`     | `#8a8ea0` | Sekundärtext                              | 5.8 : 1                   |
| `--color-text-subtle`    | `#7d8193` | Meta (Jahreszahlen, Labels)               | 4.9 : 1                   |
| `--color-accent`         | `#007588` | Markenfarbe Petrol: Flächen, Buttons      | Weiß darauf: 5.4 : 1      |
| `--color-accent-text`    | `#2aa7bb` | Akzent **als Text** (Links, Überzeilen)   | 6.6 : 1                   |
| `--color-accent-bright`  | `#63b7ed` | Highlights                                | 8.6 : 1                   |
| `--color-wordmark`       | `#e8e3dc` | Logo-Wortmarke (warmes Weiß)              | –                         |
| `--color-neon`           | `#22d3e6` | Neon-Glow des Chatfensters (nur Leuchten) | –                         |

> `#007588` ist als **Textfarbe** auf Dunkel zu schwach (3.5 : 1) – dafür immer `--color-accent-text`.

Transparente Akzentflächen: `rgb(var(--color-accent-rgb) / 0.16)`.

## Schriften

| Schrift            | Einsatz                                  | Datei                                 |
| ------------------ | ---------------------------------------- | ------------------------------------- |
| **DM Sans**        | Fließtext, Headlines (variabel 100–1000) | `public/fonts/dm-sans/*.woff2`        |
| **JetBrains Mono** | Labels, Buttons, Meta (variabel 100–800) | `public/fonts/jetbrains-mono/*.woff2` |

- Beide sind Google Fonts unter der **SIL Open Font License** – liegen **lokal** im Projekt (kein Google-Server).
- Variable Fonts: eine Datei für alle Stärken, aufgeteilt in `latin` (Deutsch/Englisch) und `latin-ext`.
- `DM Sans latin` wird vorgeladen (`<link rel="preload">` in `root.tsx`).

### Neue Schrift hinzufügen

1. `.woff2` (am besten variabel, Subsets `latin` + `latin-ext`) nach `web/public/fonts/<name>/` legen,
   **Lizenzdatei daneben** (z. B. `OFL.txt`).
2. `@font-face` in `styles/fonts.css`, Token in `tokens.css`.
3. Eintrag in [07-lizenzen.md](07-lizenzen.md).

### Typografie-Regeln

- Headlines: **Großbuchstaben**, Gewicht 700, enge Zeilenhöhe (`--leading-none`), leicht negatives Tracking.
- Labels/Buttons: JetBrains Mono, Großbuchstaben, `--tracking-mono`, klein (`--text-2xs`/`--text-xs`).
- Fließtext: DM Sans 300–400, `--leading-normal` bis `--leading-relaxed`.
- Größen sind fluid (`clamp()`), z. B. `--text-display`, `--text-3xl`.

## Abstände, Layout, Radien

- 4-px-Raster: `--space-1` (4 px) bis `--space-10` (128 px).
- Sektionsabstand: `--section-y`, Seitenrand: `--gutter`, max. Breite: `--container-max` (1440 px).
- Radien: `--radius-sm` 6 · `--radius-md` 10 · `--radius-lg` 16 · `--radius-pill`.

## Bewegung

| Token           | Wert                        | Einsatz                               |
| --------------- | --------------------------- | ------------------------------------- |
| `--ease-out`    | `cubic-bezier(.16,1,.3,1)`  | Einblenden, Öffnen („Framer-Feeling“) |
| `--ease-in-out` | `cubic-bezier(.76,0,.24,1)` | Schließen, Hamburger-Icon             |
| `--duration-*`  | 180 / 320 / 600 / 900 ms    | schnell → langsam                     |

- **Scroll-Reveal:** Attribut `data-reveal` an ein Element → blendet beim Reinscrollen weich ein
  (reines CSS, Scroll-Driven Animations; ohne Browser-Support einfach sichtbar).
- **Reduzierte Bewegung:** `prefers-reduced-motion` schaltet Animationen global ab (`base.css`).

## Komponenten-Übersicht

| Komponente       | Datei                                  | Hinweis                                                                  |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| Header („Insel“) | `components/layout/Header.tsx`         | wie alte Seite; Desktop: „Leistungen“ klappt auf; Mobil: Menü-Liste      |
| Sprachwechsel    | `components/layout/LanguageSwitch.tsx` | DE/EN-Pille mit gleitendem Indikator                                     |
| Footer           | `components/layout/Footer.tsx`         | CTA, Navigation, Rechtliches, Cookie-Einstellungen                       |
| Button           | `components/ui/Button.tsx`             | `ButtonLink` (intern), `ButtonAnchor` (extern/mailto), `Button`          |
| Section          | `components/ui/Section.tsx`            | Überzeile + H2 + Inhalt (+ optional Footer-Aktion)                       |
| PageHeader       | `components/sections/PageHeader.tsx`   | H1 jeder Unterseite                                                      |
| Hero             | `components/sections/Hero.tsx`         | Startseite: nur das Chatfenster, einfarbiger Hintergrund, unsichtbare H1 |
| ProjectCard/Grid | `components/project/*`                 | 4:3-Karten, 3/2/1 Spalten                                                |
| Ask-Widget       | `features/ask/AskWidget.tsx`           | siehe [09-ask-widget.md](09-ask-widget.md)                               |
| LogoMark3D       | `components/brand/LogoMark3D.tsx`      | Bildmarke mit Verlauf + Tiefe (Chat-Avatar)                              |
| Cookie-Banner    | `features/consent/CookieBanner.tsx`    | siehe [06-datenschutz.md](06-datenschutz.md)                             |

## Startseite: Foto + helles Chatfenster

- **Hintergrund:** eigenes, gemaltes Japan-Motiv (Kyoto, Kiyomizu-dera) vollflächig hinter Hero
  und Header (`components/sections/Hero.module.css`), oben abgedunkelt (das Motiv ist hell und
  kleinteilig – die Begrüßung hat zusätzlich einen kräftigen Textschatten), unten weicher
  Übergang in `--color-bg`. Bild tauschen: neue Datei als
  `assets/photos/backgrounds/japan.jpg` ablegen → `npm run photos` →
  `web/public/images/hero/japan-1280|2560|3840.webp` (Liste `HERO_IMAGES` in
  `web/scripts/photos.mjs`), per `links()` in `routes/home.tsx` vorgeladen.
- **Chatfenster:** fast deckende weiße Fläche `--glass-light` (Weiß 95 %) mit breitem,
  durchscheinendem Glas-Rahmen wie die Rahmen auf github.com: `--glass-frame` (Weiß 26 %, Blur 24px).
  Der Rahmen ist 10px breit, mobil 6px. Außen liegt eine feine helle Kante (`--glass-frame-edge`).
  Bei Fokus wird beides etwas heller (`--glass-light-strong`, `--glass-frame-strong`).
  Text `--ink` (17 : 1), Sekundärtext `--ink-muted`/`--ink-subtle`, Akzent Petrol
  `--color-accent`, Senden-Button schwarz. „Neuer Chat“/„Schließen“ als Pillen mit schmalem
  Rahmen (3px). Ohne `backdrop-filter`-Unterstützung ist die Fläche fast deckend
  (`--glass-light-strong`).
- Begrüßung über dem Fenster: weiß mit weichem Schatten (steht auf dem Foto).
- Die Foto-Vergrößerung (Lightbox) bleibt dunkel.

## Header-Verhalten

Gestaltet wie der Header der alten Seite (achimbenzel.com): dunkle Glas-Insel (`--color-nav`,
Blur 20px), 1px heller Rand (`--color-nav-border`), Radius 16px, Logo 1.85rem hoch.

- Beim ersten Laden fährt die Insel von oben ein (läuft auch ohne JavaScript).
- **Desktop (≥ 1100 px):** breite Leiste (8vw Rand, max. 1400px), Links rechts, daneben der
  Sprach-Button („EN“ auf deutschen Seiten). Hover/Klick auf „Leistungen“ lässt die Insel nach
  unten wachsen und zeigt die drei Leistungen als Karten. Schließt bei Mausverlassen, `Esc`,
  Klick außerhalb, Navigation.
- **Mobil/Tablet:** schmale Insel (max. 680px) mit Logo und Petrol-Menü-Button (drei Linien → X).
  Die Insel wächst zum Menü (deckend), Links blenden gestaffelt ein, darunter der Sprach-Button.
- Technik: `grid-template-rows: 0fr → 1fr` (Höhe animieren ohne JS-Messung) + `--i`-Staffelung.
