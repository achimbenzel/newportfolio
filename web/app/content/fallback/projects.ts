/**
 * PLATZHALTER-Projekte – werden nur verwendet, solange Sanity nicht verbunden ist
 * (SANITY_PROJECT_ID leer). Danach kommen alle Projekte aus dem Studio.
 * Bilder fehlen bewusst: Karten zeigen dann eine generierte Fläche in `color`.
 */
import type { L10n } from "../../lib/l10n";

export type FallbackProject = {
  slug: string;
  year: number;
  featured: boolean;
  color: string;
  client: string;
  software: string[];
  title: L10n;
  category: L10n;
  scope: L10n;
  industry?: L10n;
  description: L10n;
  /** zusätzliche Suchbegriffe für den Chat „Frag Achim“ */
  askKeywords?: string[];
};

export const fallbackProjects: FallbackProject[] = [
  {
    slug: "gute-stube",
    year: 2025,
    featured: true,
    color: "#34505c",
    client: "Gute Stube",
    software: ["Adobe Illustrator", "Adobe Photoshop", "Miro"],
    title: { de: "Gute Stube Freisen", en: "Gute Stube Freisen" },
    category: { de: "Brand Identity", en: "Brand Identity" },
    scope: {
      de: "Markenstrategie, Visuelle Identität, Digital Design",
      en: "Brand Strategy, Visual Identity, Digital Design",
    },
    industry: { de: "Gastronomie", en: "Gastronomy" },
    askKeywords: ["café", "bistro", "restaurant", "hausmannskost"],
    description: {
      de: "Die Gute Stube ist ein im Jahr 2025 von Köchin und Küchenmeisterin Kiara Balling gegründetes Café & Bistro in Freisen. Besonders an der Guten Stube ist, dass auf Hausmannskost sowie eine angenehme Atmosphäre gesetzt wird. Ziel war es, genau diese Aspekte in der Markenidentität widerzuspiegeln.",
      en: "Gute Stube is a café and bistro founded in 2025 by chef Kiara Balling. What makes it special is its focus on hearty home-style cooking and a welcoming atmosphere. The goal was to reflect exactly these values in the brand identity.",
    },
  },
  {
    slug: "joeys-picknick",
    year: 2026,
    featured: true,
    color: "#3b2618",
    client: "Joeys Picknick",
    software: [],
    title: { de: "Joeys Picknick Mainz", en: "Joeys Picknick Mainz" },
    category: { de: "Brand Identity", en: "Brand Identity" },
    scope: {
      de: "Markenstrategie, Visuelle Identität, Digital Design",
      en: "Brand Strategy, Visual Identity, Digital Design",
    },
    industry: { de: "Gastronomie", en: "Gastronomy" },
    askKeywords: ["foodtruck", "food truck", "picknickkorb", "rhein"],
    description: {
      de: "Joeys Picknick ist ein moderner Foodtruck aus Mainz, der sich auf die Vermietung liebevoll zusammengestellter Picknickkörbe entlang des Rheinufers spezialisiert hat.",
      en: "Joeys Picknick is a modern food truck from Mainz that specialises in renting out thoughtfully curated picnic baskets along the banks of the Rhine.",
    },
  },
  {
    slug: "lumakeys",
    year: 2026,
    featured: true,
    color: "#3d1856",
    client: "LumaKeys",
    software: [],
    title: { de: "LumaKeys", en: "LumaKeys" },
    category: { de: "Logo Design", en: "Logo Design" },
    scope: { de: "Logo Design", en: "Logo Design" },
    description: {
      de: "Platzhaltertext – die Projektbeschreibung wird später in Sanity gepflegt.",
      en: "Placeholder text – the project description will be managed in Sanity later.",
    },
  },
];
