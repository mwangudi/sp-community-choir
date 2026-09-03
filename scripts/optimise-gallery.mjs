/**
 * Bulk-optimise photos dropped into public/gallery.
 *
 * WhatsApp/phone exports arrive as large JPEGs with spaces and brackets in the
 * name, which are neither URL-safe nor cheap to serve. This converts them to
 * AVIF at web sizes, renames them predictably, and moves the originals out of
 * public/ so they are not deployed.
 *
 *   node scripts/optimise-gallery.mjs [--dry]
 */

import { mkdir, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const GALLERY = "public/gallery";
const ORIGINALS = "originals/gallery-import";
const MAX_WIDTH = 1600;
const QUALITY = 58;

const dry = process.argv.includes("--dry");

/** "WhatsApp Image 2026-08-18 at 14.08.19.jpeg" → "2026-08-18" */
function dateFrom(name) {
  return name.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? "undated";
}

const entries = (await readdir(GALLERY))
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort();

if (entries.length === 0) {
  console.log("Nothing to convert.");
  process.exit(0);
}

const manifest = [];
let index = 0;
let before = 0;
let after = 0;

for (const file of entries) {
  index += 1;
  const date = dateFrom(file);
  const slug = `choir-${date}-${String(index).padStart(3, "0")}`;
  const source = path.join(GALLERY, file);
  const target = path.join(GALLERY, `${slug}.avif`);

  const image = sharp(source).rotate();
  const meta = await image.metadata();
  const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);

  if (!dry) {
    const out = await image
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: QUALITY })
      .toBuffer();
    await writeFile(target, out);
    after += out.length;
  }
  before += (await sharp(source).metadata()).size ?? 0;

  manifest.push({
    slug,
    src: `/gallery/${slug}.avif`,
    takenOn: date === "undated" ? null : date,
    sortOrder: index,
    original: file,
  });
}

if (!dry) {
  await mkdir(ORIGINALS, { recursive: true });
  for (const item of manifest) {
    await rename(
      path.join(GALLERY, item.original),
      path.join(ORIGINALS, item.original),
    );
  }
  await writeFile(
    path.join(ORIGINALS, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`${manifest.length} images`);
console.log(`before ${mb(before)} → after ${mb(after)}`);
console.log(dry ? "(dry run — nothing written)" : `originals moved to ${ORIGINALS}/`);
