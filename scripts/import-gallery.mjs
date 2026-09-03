/**
 * Register optimised gallery photos in the database.
 *
 * Reads the manifest written by optimise-gallery.mjs and upserts one
 * GalleryItem per photo, so re-running is safe. Photos land unpublished —
 * caption and publish them from the admin once consent is confirmed.
 *
 *   node --env-file=.env scripts/import-gallery.mjs [--publish]
 */

import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const publish = process.argv.includes("--publish");

const manifest = JSON.parse(
  await readFile("originals/gallery-import/manifest.json", "utf8"),
);

// Keep imported photos after anything already curated by hand.
const last = await prisma.galleryItem.findFirst({ orderBy: { sortOrder: "desc" } });
const base = (last?.sortOrder ?? 0) + 1;

let created = 0;
let updated = 0;

for (const [i, item] of manifest.entries()) {
  const existing = await prisma.galleryItem.findUnique({
    where: { slug: item.slug },
    select: { id: true },
  });

  const data = {
    kind: "PHOTO",
    src: item.src,
    alt: "St. Paul's Chapel Community Choir",
    takenOn: item.takenOn ? new Date(`${item.takenOn}T00:00:00.000Z`) : null,
    tags: ["2026", "choir-life"],
    sortOrder: base + i,
    isPublished: publish,
  };

  if (existing) {
    await prisma.galleryItem.update({ where: { slug: item.slug }, data });
    updated += 1;
  } else {
    await prisma.galleryItem.create({ data: { ...data, slug: item.slug } });
    created += 1;
  }
}

console.log(`created ${created}, updated ${updated}`);
console.log(publish ? "published" : "left unpublished — publish from the admin");

await prisma.$disconnect();
