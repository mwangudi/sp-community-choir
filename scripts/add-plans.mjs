/**
 * Applies the Mass plans in prisma/data/added-plans.json.
 *
 *   node scripts/add-plans.mjs
 *
 * A plan built for an upcoming Sunday is not in the worship aid archive, so it
 * would otherwise live only on the machine it was typed on. Keeping it here
 * carries it to every machine and survives a re-import.
 *
 * Safe to re-run: plans upsert by date and their items are rebuilt.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, "..", "prisma", "data", "added-plans.json");

const ORDER = [
  "ENTRANCE", "PENITENTIAL", "KYRIE", "GLORIA", "GOSPEL_PROCESSION",
  "RESPONSORIAL_PSALM", "GOSPEL_ACCLAMATION", "CREED", "OFFERTORY",
  "PREPARATION_OF_GIFTS", "SANCTUS", "MYSTERY_OF_FAITH", "GREAT_AMEN",
  "OUR_FATHER", "SIGN_OF_PEACE", "AGNUS_DEI", "COMMUNION", "ANIMA_CHRISTI",
  "THANKSGIVING", "RECESSIONAL", "MARIAN_HYMN",
];

async function main() {
  const plans = JSON.parse(readFileSync(DATA, "utf8"));
  let created = 0;
  let rebuilt = 0;

  for (const plan of plans) {
    const date = new Date(`${plan.date}T00:00:00.000Z`);

    const rows = plan.items
      .slice()
      .sort((a, b) => ORDER.indexOf(a.part) - ORDER.indexOf(b.part))
      .map((i, sortOrder) => ({
        part: i.part,
        song: i.song,
        songSlug: i.slug ?? null,
        sortOrder,
      }));

    // A slug that no longer exists would print a song with no words at all.
    const slugs = [...new Set(rows.map((r) => r.songSlug).filter(Boolean))];
    const found = await prisma.song.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    const missing = slugs.filter((s) => !found.some((f) => f.slug === s));
    if (missing.length > 0) {
      throw new Error(`${plan.date}: no song for ${missing.join(", ")}`);
    }

    const base = {
      name: plan.name,
      year: plan.year,
      season: plan.season ?? null,
      setting: plan.setting ?? null,
      ...(Object.hasOwn(plan, "youtubeId")
        ? { youtubeId: plan.youtubeId || null }
        : {}),
      notes: plan.notes ?? null,
      status: plan.status ?? "DRAFT",
    };

    const existing = await prisma.massPlan.findUnique({
      where: { date },
      select: { id: true },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.massPlanItem.deleteMany({ where: { planId: existing.id } }),
        prisma.massPlan.update({
          where: { id: existing.id },
          data: { ...base, items: { create: rows } },
        }),
      ]);
      rebuilt += 1;
    } else {
      await prisma.massPlan.create({ data: { date, ...base, items: { create: rows } } });
      created += 1;
    }

    const withoutLyrics = rows.filter((r) => !r.songSlug).map((r) => r.song);
    console.log(`${plan.date} — ${plan.name}: ${rows.length} items`);
    if (withoutLyrics.length > 0) {
      console.log(`   no lyrics on file: ${withoutLyrics.join(", ")}`);
    }
  }

  console.log(`\nPlans: ${created} added, ${rebuilt} rebuilt.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
