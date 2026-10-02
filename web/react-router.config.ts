import type { Config } from "@react-router/dev/config";
// Hinweis: alles, was hier importiert wird, nutzt RELATIVE Imports (keine "~/"-Aliase verfügbar)
import { getPrerenderPaths } from "./app/content/pages.server";

/**
 * React Router (Framework-Modus) – Build-Konfiguration.
 *
 * ssr: false + prerender  →  Jede Seite wird beim Build als fertiges HTML
 * erzeugt (Static Site Generation). Suchmaschinen und KI-Crawler bekommen
 * vollständigen Inhalt, ohne JavaScript ausführen zu müssen. Danach
 * übernimmt React im Browser (Hydration) für Animationen & Navigation.
 *
 * Es gibt KEINEN Node-Server in Produktion – nur statische Dateien.
 */
export default {
  ssr: false,
  prerender: getPrerenderPaths,
} satisfies Config;
