/**
 * Imports the parsed Sunday worship aids in prisma/data/liturgical-songs.json:
 * the song catalogue with lyrics, and a Mass plan for each Sunday.
 *
 *   node scripts/import-lyrics.mjs            # songs only
 *   node scripts/import-lyrics.mjs --plans    # songs and Mass plans
 *   node scripts/import-lyrics.mjs --publish  # …and publish those plans
 *   node scripts/import-lyrics.mjs --replace-lyrics   # overwrite existing lyrics
 *   node scripts/import-lyrics.mjs --prune            # drop merged duplicates
 *
 * Safe to re-run: songs upsert by slug and plans by date. Existing lyrics are
 * only replaced when the imported version is longer, so hand edits survive —
 * unless --replace-lyrics is given, which is needed after a parser fix.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, "..", "prisma", "data", "liturgical-songs.json");

const withPlans = process.argv.includes("--plans");
const publish = process.argv.includes("--publish");
const replaceLyrics = process.argv.includes("--replace-lyrics");
const prune = process.argv.includes("--prune");

const textLength = (html) => (html ?? "").replace(/<[^>]+>/g, "").trim().length;

async function main() {
  const { songs, plans } = JSON.parse(readFileSync(DATA, "utf8"));

  let created = 0;
  let updated = 0;
  let keptLyrics = 0;

  for (const song of songs) {
    const existing = await prisma.song.findUnique({
      where: { slug: song.slug },
      select: { slug: true, lyrics: true },
    });

    // Never shorten what is already there — an admin may have tidied it.
    const better =
      replaceLyrics || textLength(song.lyrics) > textLength(existing?.lyrics ?? "");
    if (existing && !better && existing.lyrics) keptLyrics += 1;

    const data = {
      title: song.title,
      language: song.language,
      massParts: song.massParts,
      seasons: [],
      // The titles this song was merged from, so searches for them still land.
      ...(song.aliases?.length ? { aliases: song.aliases } : {}),
      ...(better ? { lyrics: song.lyrics } : {}),
    };

    if (existing) {
      await prisma.song.update({ where: { slug: song.slug }, data });
      updated += 1;
    } else {
      await prisma.song.create({
        data: { slug: song.slug, ...data, lyrics: song.lyrics ?? null },
      });
      created += 1;
    }
  }

  console.log(
    `Songs: ${created} added, ${updated} updated (${keptLyrics} kept their existing lyrics).`,
  );

  if (!withPlans) {
    console.log("Mass plans skipped — re-run with --plans to import them.");
    await pruneMerged(new Set(songs.map((s) => s.slug)));
    return;
  }

  let plansCreated = 0;
  let plansUpdated = 0;

  for (const plan of plans) {
    const date = new Date(`${plan.date}T00:00:00.000Z`);
    const rows = plan.items
      .filter((i) => i.song)
      .map((i, index) => ({
        part: i.part,
        song: i.song,
        songSlug: i.slug ?? null,
        sortOrder: index,
      }));
    if (rows.length === 0) continue;

    const existing = await prisma.massPlan.findUnique({
      where: { date },
      select: { id: true },
    });

    const base = {
      name: plan.name,
      year: plan.year,
      ...(publish ? { status: "PUBLISHED" } : {}),
    };

    if (existing) {
      // Rebuild the order of service so re-runs never duplicate rows.
      await prisma.$transaction([
        prisma.massPlanItem.deleteMany({ where: { planId: existing.id } }),
        prisma.massPlan.update({
          where: { id: existing.id },
          data: { ...base, items: { create: rows } },
        }),
      ]);
      plansUpdated += 1;
    } else {
      await prisma.massPlan.create({
        data: {
          date,
          ...base,
          status: publish ? "PUBLISHED" : "DRAFT",
          items: { create: rows },
        },
      });
      plansCreated += 1;
    }
  }

  console.log(
    `Mass plans: ${plansCreated} added, ${plansUpdated} rebuilt${publish ? " and published" : " as drafts"}.`,
  );

  await pruneMerged(new Set(songs.map((s) => s.slug)));
}

/**
 * A re-parse that merges duplicates leaves the superseded rows behind. Only
 * those nothing points at can go; anything still in use is reported instead.
 */
async function pruneMerged(keep) {
  if (!prune) return;

  const stale = await prisma.song.findMany({
    where: { slug: { notIn: [...keep] } },
    select: {
      slug: true,
      title: true,
      _count: { select: { massPlanItems: true } },
    },
  });
  if (stale.length === 0) {
    console.log("Prune: nothing to remove.");
    return;
  }

  const removable = stale.filter((s) => s._count.massPlanItems === 0);
  const inUse = stale.filter((s) => s._count.massPlanItems > 0);

  await prisma.song.deleteMany({
    where: { slug: { in: removable.map((s) => s.slug) } },
  });

  console.log(`Prune: removed ${removable.length} superseded songs.`);
  if (inUse.length > 0) {
    console.log(`Prune: kept ${inUse.length} still used by a Mass plan:`);
    inUse.slice(0, 20).forEach((s) => console.log(`   - ${s.title}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
