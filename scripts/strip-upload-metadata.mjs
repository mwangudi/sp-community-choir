/**
 * Removes EXIF/XMP/IPTC metadata — GPS positions included — from images
 * uploaded before uploads were cleaned on the way in (src/lib/storage.ts).
 *
 *   node scripts/strip-upload-metadata.mjs [uploads dir] [--dry-run]
 *
 * The directory defaults to public/uploads; on the droplet pass
 * /var/lib/choir-uploads. Files keep their names, so no database row changes.
 * Each is re-encoded in its own format, upright, and written over the
 * original only once the clean copy is complete.
 *
 * Safe to re-run: a file with no metadata left is skipped.
 */

import { chmod, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const root = args.find((a) => !a.startsWith("--")) ?? path.join(process.cwd(), "public", "uploads");

async function* images(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* images(p);
    else if (/\.(jpe?g|png|webp|avif)$/i.test(entry.name)) yield p;
  }
}

function encode(image, file) {
  switch (path.extname(file).toLowerCase()) {
    case ".png":
      return image.png();
    case ".webp":
      return image.webp({ quality: 88 });
    case ".avif":
      return image.avif({ quality: 60 });
    default:
      return image.jpeg({ quality: 88, mozjpeg: true });
  }
}

let cleaned = 0;
let checked = 0;
for await (const file of images(root)) {
  checked += 1;
  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  if (!meta.exif && !meta.xmp && !meta.iptc) continue;

  if (!dryRun) {
    const out = await encode(sharp(input).rotate(), file).toBuffer();
    // Write beside it, then swap, so a failure never leaves half a file.
    const tmp = `${file}.clean`;
    await writeFile(tmp, out);
    const { mode } = await stat(file);
    await rename(tmp, file);
    await chmod(file, mode);
  }
  cleaned += 1;
  console.log(`${path.relative(root, file)} — ${[meta.exif && "EXIF", meta.xmp && "XMP", meta.iptc && "IPTC"].filter(Boolean).join(", ")}`);
}

console.log(`\n${checked} image(s) checked, ${cleaned}${dryRun ? " would be" : ""} cleaned.`);
