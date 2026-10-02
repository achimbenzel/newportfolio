import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import type { Img } from "~/content/types";
import { env, isSanityConfigured } from "~/lib/env.server";

/**
 * Bilder aus Sanity werden beim Build HERUNTERGELADEN und unter /media/…
 * von unserem eigenen Server ausgeliefert. So baut der Browser des Besuchers
 * keine Verbindung zu cdn.sanity.io auf (gleiches Prinzip wie lokale Fonts).
 *
 * Dev:   web/public/media/        (vom Vite-Dev-Server ausgeliefert, gitignored)
 * Build: web/build/client/media/  (landet direkt im Deploy-Ordner)
 */
const OUTPUT_DIR = resolve(
  process.cwd(),
  import.meta.env.DEV ? "public/media" : "build/client/media",
);
const PUBLIC_PREFIX = "/media";
const DEFAULT_WIDTHS = [640, 1280, 1920];

const builder = isSanityConfigured
  ? createImageUrlBuilder({ projectId: env.sanity.projectId, dataset: env.sanity.dataset })
  : null;

/** Laufende Downloads – verhindert doppelte Downloads bei parallelem Prerendering. */
const pending = new Map<string, Promise<string>>();

async function download(url: string): Promise<string> {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 16);
  const fileName = `${hash}.webp`;
  const target = resolve(OUTPUT_DIR, fileName);

  if (!existsSync(target)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Bild-Download fehlgeschlagen (${response.status}): ${url}`);
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(target, new Uint8Array(await response.arrayBuffer()));
  }
  return `${PUBLIC_PREFIX}/${fileName}`;
}

function downloadOnce(url: string): Promise<string> {
  let job = pending.get(url);
  if (!job) {
    job = download(url);
    pending.set(url, job);
  }
  return job;
}

export type SanityImageInput = {
  asset?: unknown;
  alt?: string | null;
  dimensions?: { width: number; height: number } | null;
} & Record<string, unknown>;

/**
 * Wandelt ein Sanity-Bildfeld in ein lokales, responsives Bild um.
 * Gibt `null` zurück, wenn kein Bild gesetzt ist.
 */
export async function localImage(
  image: SanityImageInput | null | undefined,
  options: { widths?: number[]; fallbackAlt?: string } = {},
): Promise<Img | null> {
  if (!builder || !image?.asset) return null;

  const original = image.dimensions ?? null;
  const widths = (options.widths ?? DEFAULT_WIDTHS).filter((w) => !original || w <= original.width);
  if (widths.length === 0) widths.push(original?.width ?? DEFAULT_WIDTHS[0]!);

  const sources = await Promise.all(
    widths.map(async (width) => {
      const url = builder
        .image(image as SanityImageSource)
        .width(width)
        .fit("max")
        .format("webp")
        .quality(82)
        .url();
      return { width, src: await downloadOnce(url) };
    }),
  );

  const largest = sources[sources.length - 1]!;
  return {
    src: largest.src,
    srcSet: sources.map((s) => `${s.src} ${s.width}w`).join(", "),
    alt: image.alt ?? options.fallbackAlt ?? "",
    width: original?.width,
    height: original?.height,
  };
}
