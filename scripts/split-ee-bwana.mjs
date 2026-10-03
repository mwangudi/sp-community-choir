/**
 * Separates three Offertory songs the import merged under one record.
 *
 *   node --env-file=.env scripts/split-ee-bwana.mjs [--dry-run]
 *
 * "Ee Bwana Vyote Mali Yako" took the aliases "Ee Bwana Twakuomba" and
 * "Ee Bwana", so two other songs printed under those names were folded into
 * it, and its own text — "Ee Bwana vyote mali yako (Bwana), Twakupa vyote
 * mali yako" — was lost from the lyrics. The aid then printed both strangers
 * under its title. This gives each song its own record:
 *
 *   ee-bwana-vyote-mali-yako           its own text again, from the source
 *   ee-bwana-twakuomba-upokee-vipaji   "Ee Bwana, twakuomba upokee vipaji vyetu"
 *   ee-bwana-twakuomba-pokea-sadaka    "Ee Bwana twakuomba, pokea sadaka"
 *
 * Past Sundays printed the first title, so they stay on it. The 3 October
 * 2026 Thanksgiving Mass sang "Upokee vipaji vyetu" and is moved to it.
 *
 * Safe to re-run: each step checks whether it has already been done.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, "..", "prisma", "data", "liturgical-songs.json");

const SOURCE = "ee-bwana-vyote-mali-yako";
const HEADING = /<p><strong>[^<]+<\/strong><\/p>/g;

const SPLIT = [
  {
    slug: "ee-bwana-twakuomba-upokee-vipaji",
    title: "Ee Bwana Twakuomba (Upokee Vipaji Vyetu)",
    marker: /upokee vipaji vyetu/i,
  },
  {
    slug: "ee-bwana-twakuomba-pokea-sadaka",
    title: "Ee Bwana Twakuomba (Pokea Sadaka)",
    marker: /pokea sadaka/i,
  },
];

/** Plans that sang one of the split songs rather than the original. */
const REPOINT = [{ date: "2026-10-03", part: "OFFERTORY", to: SPLIT[0] }];

/** The song's own text, which only survives as a variant in the source. */
function originalText() {
  const { songs } = JSON.parse(readFileSync(DATA, "utf8"));
  const variant = songs
    .find((s) => s.slug === SOURCE)
    ?.variants?.find((v) => /twakupa vyote mali yako/i.test(v.plain));
  if (!variant) throw new Error(`${SOURCE}: its own text is missing from the source`);
  return variant.lyrics.trim();
}

async function main() {
  const source = await prisma.song.findUnique({ where: { slug: SOURCE } });
  if (!source) throw new Error(`${SOURCE}: not found`);

  const blocks = (source.lyrics ?? "")
    .split(HEADING)
    .map((b) => b.trim())
    .filter(Boolean);

  if (!SPLIT.some((s) => blocks.some((b) => s.marker.test(b)))) {
    console.log(`${source.title}: already split`);
  } else {
    if (!dryRun) {
      writeFileSync(`/tmp/${SOURCE}-original.json`, JSON.stringify(source, null, 1));
    }

    for (const spec of SPLIT) {
      const body = blocks.find((b) => spec.marker.test(b));
      if (!body) throw new Error(`${spec.title}: its text is not in ${SOURCE}`);
      const existing = await prisma.song.findUnique({ where: { slug: spec.slug } });
      if (existing) {
        console.log(`${spec.title}: already present`);
        continue;
      }
      if (!dryRun) {
        await prisma.song.create({
          data: {
            slug: spec.slug,
            title: spec.title,
            language: "SWAHILI",
            massParts: ["OFFERTORY"],
            seasons: [],
            aliases: ["Ee Bwana Twakuomba"],
            lyrics: body,
          },
        });
      }
      console.log(`${spec.title}: added`);
    }

    // Its alias belongs to the songs that now carry it.
    const aliases = (Array.isArray(source.aliases) ? source.aliases : []).filter(
      (a) => a !== "Ee Bwana Twakuomba",
    );
    if (!dryRun) {
      await prisma.song.update({
        where: { slug: SOURCE },
        data: { lyrics: originalText(), aliases },
      });
    }
    console.log(`${source.title}: its own text restored (original saved to /tmp/${SOURCE}-original.json)`);
  }

  for (const r of REPOINT) {
    const where = {
      songSlug: SOURCE,
      part: r.part,
      plan: { date: new Date(`${r.date}T00:00:00.000Z`) },
    };
    const count = await prisma.massPlanItem.count({ where });
    if (count > 0 && !dryRun) {
      await prisma.massPlanItem.updateMany({
        where,
        data: { songSlug: r.to.slug, song: r.to.title },
      });
    }
    console.log(`${r.date} ${r.part}: ${count} item(s) moved to ${r.to.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
