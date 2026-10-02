/**
 * Zentrale Website-Konfiguration. Öffentliche Daten – nichts Geheimes hier!
 * Geheimnisse (Tokens) gehören in `.env` und dürfen nur in *.server.ts gelesen werden.
 */
const rawUrl: string = import.meta.env.VITE_SITE_URL || "https://achimbenzel.com";

export const site = {
  name: "Achim Benzel",
  url: rawUrl.replace(/\/+$/, ""),
  email: "info@achimbenzel.com",
  /** WhatsApp (nur Nachrichten). Hinweis zum Datenschutz: docs/06-datenschutz.md */
  whatsapp: "+49 163 9877331",
  /** Pfad zum Standard-Social-Image (1200×630) – TODO: Grafik erstellen, siehe docs/08-roadmap.md */
  defaultOgImage: null as string | null,
  /** Social-Profile (Footer, JSON-LD „sameAs“, Chat „Frag Achim“) – reine Links, kein Tracking */
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/achim-benzel-9a1890279/" },
    { label: "Instagram", url: "https://instagram.com/achimbenzel" },
    { label: "Behance", url: "https://behance.net/achimbenzel" },
    { label: "Pinterest", url: "https://pinterest.com/achimbenzel/_created/" },
    { label: "X", url: "https://x.com/achimbenzel" },
  ] as { label: string; url: string }[],
} as const;
