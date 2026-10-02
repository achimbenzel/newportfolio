/**
 * Domänen-Typen der Website. Komponenten bekommen IMMER fertig lokalisierte
 * Daten in diesen Formen – egal ob sie aus Sanity oder aus den Platzhaltern kommen.
 */
import type { ServiceSlug } from "~/config/services";

export type Img = {
  /** Lokaler Pfad (/media/…) – nie eine Fremd-URL, siehe docs/06-datenschutz.md */
  src: string;
  srcSet?: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ProjectSummary = {
  slug: string;
  title: string;
  category: string;
  year: number;
  cover: Img | null;
  /** Markenfarbe des Projekts – Hintergrund für Platzhalter & Karten */
  color: string | null;
};

export type ProjectBlock =
  | { type: "image"; key: string; image: Img; caption?: string }
  | { type: "imageGrid"; key: string; images: Img[] }
  | { type: "text"; key: string; heading?: string; body: string; align: "left" | "center" }
  | { type: "video"; key: string; provider: "vimeo" | "youtube"; videoId: string; title: string };

export type Project = ProjectSummary & {
  client?: string;
  scope?: string;
  industry?: string;
  software: string[];
  description: string;
  content: ProjectBlock[];
  seo?: { title?: string; description?: string };
};

export type Service = {
  slug: ServiceSlug;
  title: string;
  intro: string;
  process: { title: string; text: string }[];
};
