/**
 * PLATZHALTER-Texte der Leistungsseiten (aus dem Ask-Widget-Briefing übernommen).
 * Werden später durch Sanity-Dokumente vom Typ „service“ ersetzt.
 */
import type { ServiceSlug } from "~/config/services";
import type { L10n } from "~/lib/l10n";

export type FallbackService = {
  title: L10n;
  intro: L10n;
  process: { title: L10n; text: L10n }[];
};

export const fallbackServices: Record<ServiceSlug, FallbackService> = {
  branding: {
    title: { de: "Brand & Logo Design", en: "Brand & Logo Design" },
    intro: {
      de: "Branding heißt hier: alle Entscheidungen, die ein Unternehmen wiedererkennbar machen, in ein System zu bringen. Logo, Typografie, Farbe und Bildwelt – dokumentiert übergeben.",
      en: "Branding here means bringing every decision that makes a company recognisable into one system: logo, typography, colour and imagery, handed over documented.",
    },
    process: [
      {
        title: { de: "Discovery", en: "Discovery" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Strategie & Positionierung", en: "Strategy & positioning" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Identity-System", en: "Identity system" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Rollout & Guidelines", en: "Rollout & guidelines" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
    ],
  },
  "motion-design": {
    title: { de: "Motion Design", en: "Motion Design" },
    intro: {
      de: "Motion Design bedeutet hier: Animation, die aus dem Brand-System entsteht und nicht daneben steht. Erst kommt das Storyboard, dann Frames, 3D-Szenen, Animation und Sound – geliefert in allen nötigen Formaten.",
      en: "Motion design here means animation that comes out of the brand system instead of sitting next to it. The storyboard comes first, then frames, 3D scenes, animation and sound – delivered in every format you need.",
    },
    process: [
      {
        title: { de: "Discovery", en: "Discovery" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Konzept & Storyboard", en: "Concept & storyboard" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Design & Animation", en: "Design & animation" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Auslieferung & Templates", en: "Delivery & templates" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
    ],
  },
  "music-visuals": {
    title: { de: "Music & Visuals", en: "Music & Visuals" },
    intro: {
      de: "Für Musik entstehen Cover, Typografie und Farbe als ein Artwork, von dem sich alles andere ableiten lässt – für Streaming, Vinyl, Canvas und Feed, still und bewegt.",
      en: "For music, cover, typography and colour are designed as one artwork that everything else can be derived from – for streaming, vinyl, canvas and feed, still and in motion.",
    },
    process: [
      {
        title: { de: "Zuhören", en: "Listening" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Richtung", en: "Direction" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Design & Motion", en: "Design & motion" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
      {
        title: { de: "Auslieferung", en: "Delivery" },
        text: { de: "Inhalt folgt.", en: "Coming soon." },
      },
    ],
  },
};
