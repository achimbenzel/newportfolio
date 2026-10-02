/**
 * Bildergalerien für den Chat (z. B. „Möchtest du Bilder aus Japan sehen?“).
 *
 * Neue Fotos:
 * 1. Originale nach  assets/photos/<album>/originals/  legen (Name = Reihenfolge + Motiv,
 *    z. B. „10-fuji.jpg“)
 * 2. `npm run photos` → erzeugt WebP-Dateien ohne Metadaten + photos.generated.ts
 * 3. Hier für jedes Bild einen Alternativtext auf Deutsch UND Englisch eintragen
 *    (`npm test` meldet fehlende oder überflüssige Einträge)
 */
import type { Locale } from "~/i18n/config";
import { photoFiles } from "./photos.generated";

export type GalleryImage = {
  /** Vorschau (480px) und Vergrößerung (1600px) */
  thumb: string;
  full: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
};

type AlbumId = keyof typeof photoFiles;

/** Alternativtexte je Bild (Schlüssel = Dateiname ohne Endung) */
const altTexts: Record<AlbumId, Record<string, Record<Locale, string>>> = {
  "japan-2024": {
    "01-kyoto-tempel": {
      de: "Rotes Tempeltor mit Pagode unter blauem Himmel in Kyoto",
      en: "Red temple gate and pagoda under a blue sky in Kyoto",
    },
    "02-tokio-bei-nacht": {
      de: "Nächtlicher Blick von oben auf die leuchtenden Straßen Tokios",
      en: "Night view from above over Tokyo's glowing streets",
    },
    "03-skyline-gtr": {
      de: "Blauer Nissan Skyline GT-R nachts auf einer Straße in Tokio",
      en: "Blue Nissan Skyline GT-R on a Tokyo street at night",
    },
    "04-tekken-arcade": {
      de: "Tekken-Automat in einer japanischen Spielhalle",
      en: "Tekken cabinet in a Japanese arcade",
    },
    "05-pacman-geist": {
      de: "Blauer Pac-Man-Geist aus einem Greifautomaten, in der Hand gehalten",
      en: "Blue Pac-Man ghost from a claw machine, held in hand",
    },
    "06-pokemon-booster": {
      de: "Drei japanische Pokémon-Boosterpacks in der Hand",
      en: "Three Japanese Pokémon booster packs in hand",
    },
    "07-udon-tempura": {
      de: "Udon-Nudelsuppe und Tempura-Reisschale auf einem Tablett",
      en: "Udon noodle soup and a tempura rice bowl on a tray",
    },
    "08-museum": {
      de: "Pointillistisches Hafengemälde in einem Museum",
      en: "Pointillist harbour painting in a museum",
    },
    "09-selfie-metro": {
      de: "Selfie von Achim in einer U-Bahn-Station in Japan",
      en: "Selfie of Achim in a subway station in Japan",
    },
  },
};

/** Galerien, die der Chat zeigen kann (Name → Album) */
export const galleries = {
  japan: "japan-2024",
} as const satisfies Record<string, AlbumId>;

export type GalleryId = keyof typeof galleries;

export function getGallery(id: GalleryId): GalleryImage[] {
  const album = galleries[id];
  return photoFiles[album].map(({ name, width, height }) => ({
    thumb: `/images/${album}/${name}-480.webp`,
    full: `/images/${album}/${name}-1600.webp`,
    width,
    height,
    alt: altTexts[album][name] ?? { de: "", en: "" },
  }));
}

/** Für Tests: alle Alternativtexte mit den erzeugten Dateien abgleichen */
export const galleryAltTexts = altTexts;
