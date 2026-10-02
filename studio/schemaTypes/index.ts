import { imageBlock, imageGrid, textBlock, videoEmbed } from "./blocks/projectBlocks";
import { project } from "./documents/project";
import { service } from "./documents/service";
import { siteSettings } from "./documents/siteSettings";
import { imageWithAlt } from "./objects/imageWithAlt";
import { localeString, localeText } from "./objects/locale";
import { seo } from "./objects/seo";

export const schemaTypes = [
  // Bausteine
  localeString,
  localeText,
  imageWithAlt,
  seo,
  imageBlock,
  imageGrid,
  textBlock,
  videoEmbed,
  // Dokumente
  project,
  service,
  siteSettings,
];

/** Dokumenttypen, von denen es genau EIN Dokument gibt */
export const singletonTypes = new Set(["siteSettings"]);
