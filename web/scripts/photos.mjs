/**
 * Fotos für die Website aufbereiten:  npm run photos
 *
 * Liest   assets/photos/<album>/originals/*.(jpg|jpeg|png|webp)   (Originale, nicht ausgeliefert)
 * Schreibt web/public/images/<album>/<name>-480.webp  (Vorschau im Chat)
 *          web/public/images/<album>/<name>-1600.webp (Vergrößerung)
 *          web/app/features/ask/photos.generated.ts   (Dateiliste mit Bildgrößen)
 *
 * - dreht Handyfotos automatisch richtig herum
 * - entfernt ALLE Metadaten (EXIF, GPS-Standort, Kameramodell …) – Datenschutz
 * - Alternativtexte (DE/EN) pflegt man von Hand in web/app/features/ask/galleries.ts
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "../..");
const albumsDir = join(root, "assets/photos");
const outputDir = join(root, "web/public/images");
const generatedFile = join(root, "web/app/features/ask/photos.generated.ts");
const SIZES = [
  { suffix: "480", size: 480, quality: 74 },
  { suffix: "1600", size: 1600, quality: 80 },
];
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const albums = {};
for (const album of (await readdir(albumsDir, { withFileTypes: true })).filter((d) =>
  d.isDirectory(),
)) {
  const sourceDir = join(albumsDir, album.name, "originals");
  if (!existsSync(sourceDir)) continue;
  const files = (await readdir(sourceDir))
    .filter((file) => EXTENSIONS.has(extname(file).toLowerCase()))
    .sort();
  const targetDir = join(outputDir, album.name);
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });

  albums[album.name] = [];
  for (const file of files) {
    const name = basename(file, extname(file)).toLowerCase();
    let large = { width: 0, height: 0 };
    for (const { suffix, size, quality } of SIZES) {
      // .rotate() ohne Winkel = nach EXIF ausrichten; sharp schreibt standardmäßig KEINE Metadaten
      const info = await sharp(join(sourceDir, file))
        .rotate()
        .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
        .webp({ quality })
        .toFile(join(targetDir, `${name}-${suffix}.webp`));
      if (suffix === "1600") large = { width: info.width, height: info.height };
    }
    albums[album.name].push({ name, ...large });
    console.log(`✓ ${album.name}/${name} (${large.width}×${large.height})`);
  }
}

await writeFile(
  generatedFile,
  `// Automatisch erzeugt von web/scripts/photos.mjs – nicht von Hand ändern (npm run photos).\n` +
    `export const photoFiles = ${JSON.stringify(albums, null, 2)} as const;\n`,
);
console.log(`\n→ ${generatedFile.replace(root + "/", "")}`);
