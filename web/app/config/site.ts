/**
 * Zentrale Website-Konfiguration. Öffentliche Daten – nichts Geheimes hier!
 * Geheimnisse (Tokens) gehören in `.env` und dürfen nur in *.server.ts gelesen werden.
 */
const rawUrl: string = import.meta.env.VITE_SITE_URL || "https://achimbenzel.com";

export const site = {
  name: "Achim Benzel",
  url: rawUrl.replace(/\/+$/, ""),
  email: "info@achimbenzel.com",
  /** Pfad zum Standard-Social-Image (1200×630) – TODO: Grafik erstellen, siehe docs/08-roadmap.md */
  defaultOgImage: null as string | null,
  /** Social-Profile (für Footer & JSON-LD „sameAs“) – folgt später. */
  socials: [] as { label: string; url: string }[],
} as const;
