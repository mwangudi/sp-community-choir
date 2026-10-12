/**
 * Applies the concerts in prisma/data/added-concerts.json, with their photos
 * and homepage hero slide.
 *
 *   node scripts/add-concerts.mjs
 *
 * Concerts, gallery photos and hero slides are otherwise typed into the admin
 * on one machine only. Keeping them here carries them to every machine, and
 * the photos they point at already ship in public/gallery.
 *
 * Safe to re-run: concerts and photos upsert by slug, a hero slide by src.
 * A photo's published flag is only set when it is first added, so a photo
 * published (or hidden) from the admin stays that way.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, "..", "prisma", "data", "added-concerts.json");

async function main() {
  const concerts = JSON.parse(readFileSync(DATA, "utf8"));

  for (const c of concerts) {
    const data = {
      title: c.title,
      startsAt: new Date(c.startsAt),
      venue: c.venue,
      blurb: c.blurb,
      description: c.description ?? [],
      poster: c.poster ?? null,
      pinned: c.pinned ?? false,
      ctaLabel: c.ctaLabel ?? null,
      ctaHref: c.ctaHref ?? null,
    };
    await prisma.concert.upsert({
      where: { slug: c.slug },
      update: data,
      create: { slug: c.slug, ...data },
    });
    console.log(`${c.slug} — ${c.title}`);

    const photos = c.photos ?? [];
    if (photos.length > 0) {
      // Keep a concert's photos after anything already in the gallery.
      const known = await prisma.galleryItem.findMany({
        where: { slug: { in: photos.map((p) => p.slug) } },
        select: { slug: true, sortOrder: true },
      });
      const last = await prisma.galleryItem.findFirst({
        where: { slug: { notIn: photos.map((p) => p.slug) } },
        orderBy: { sortOrder: "desc" },
      });
      const base = (last?.sortOrder ?? 0) + 1;
      const takenOn = new Date(`${c.startsAt.slice(0, 10)}T00:00:00.000Z`);
      const credit = c.photographer ? `Photo: ${c.photographer}` : null;

      let added = 0;
      for (const [i, p] of photos.entries()) {
        const data = {
          kind: "PHOTO",
          src: p.src,
          alt: p.alt ?? `St. Paul's Chapel Community Choir at ${c.title}`,
          caption: [p.caption ?? c.title, credit].filter(Boolean).join(" · "),
          takenOn,
          tags: [c.startsAt.slice(0, 4), "concerts", c.slug],
          sortOrder: known.find((k) => k.slug === p.slug)?.sortOrder ?? base + i,
        };
        if (known.some((k) => k.slug === p.slug)) {
          await prisma.galleryItem.update({ where: { slug: p.slug }, data });
        } else {
          await prisma.galleryItem.create({
            data: { slug: p.slug, ...data, isPublished: p.published ?? false },
          });
          added += 1;
        }
      }
      console.log(`   photos: ${added} added, ${photos.length - added} updated`);
    }

    if (c.heroSlide) {
      const s = c.heroSlide;
      const fields = {
        alt: s.alt ?? null,
        caption: s.caption ?? null,
        kicker: s.kicker ?? null,
        title: s.title ?? null,
        focus: s.focus ?? null,
      };
      const existing = await prisma.slide.findFirst({
        where: { placement: "HERO", src: s.src },
        select: { id: true },
      });
      if (existing) {
        await prisma.slide.update({ where: { id: existing.id }, data: fields });
        console.log("   hero slide updated");
      } else {
        // A new event leads the carousel; reorder from the admin if not.
        const first = await prisma.slide.findFirst({
          where: { placement: "HERO" },
          orderBy: { sortOrder: "asc" },
        });
        await prisma.slide.create({
          data: {
            placement: "HERO",
            src: s.src,
            ...fields,
            sortOrder: (first?.sortOrder ?? 1) - 1,
          },
        });
        console.log("   hero slide added at the front");
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
