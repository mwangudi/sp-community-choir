/**
 * One-off repairs for two records that hold the wrong text, not just a
 * hidden one.
 *
 *   node scripts/split-sequence.mjs [--dry-run]
 *
 * "Sequence" carried both the Pentecost sequence, Veni Sancte Spiritus, and
 * the Corpus Christi one, Lauda Sion, under a single heading. The worship aid
 * prints the first block it finds, so the Corpus Christi Mass was set to print
 * the Pentecost text. Split them into the two hymns they are and point each
 * Sunday at its own.
 *
 * "Sweet Sacrament Divine" ends with a second Communion block holding the
 * single word "Organ" — a direction to the organist, not something to print.
 * It moves to the song's notes.
 *
 * Safe to re-run: each step checks whether it has already been done.
 */

import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const HEADING = /<p><strong>([^<]+)<\/strong><\/p>/g;

function blocks(lyrics) {
  const found = [];
  for (let m = HEADING.exec(lyrics); m; m = HEADING.exec(lyrics)) {
    found.push({ label: m[1].trim(), start: m.index + m[0].length, head: m.index });
  }
  HEADING.lastIndex = 0;
  return found.map((f, i) => ({
    label: f.label,
    body: lyrics.slice(f.start, i + 1 < found.length ? found[i + 1].head : lyrics.length).trim(),
  }));
}

const SPLIT = [
  {
    slug: "veni-sancte-spiritus",
    title: "Veni Sancte Spiritus (Pentecost Sequence)",
    language: "LATIN",
    block: 0,
    sunday: "2026-05-24",
  },
  {
    slug: "lauda-sion",
    title: "Lauda Sion (Corpus Christi Sequence)",
    language: "ENGLISH",
    block: 1,
    sunday: "2026-06-07",
  },
];

async function splitSequence() {
  const source = await prisma.song.findUnique({ where: { slug: "sequence" } });
  if (!source) {
    console.log("Sequence: already split");
    return;
  }

  const parts = blocks(source.lyrics);
  if (parts.length !== 2) {
    throw new Error(`Sequence: expected 2 blocks, found ${parts.length}`);
  }

  const written = [];
  for (const spec of SPLIT) {
    const body = parts[spec.block].body;
    const existing = await prisma.song.findUnique({ where: { slug: spec.slug } });
    if (existing) {
      console.log(`${spec.title}: already present`);
    } else if (!dryRun) {
      await prisma.song.create({
        data: {
          slug: spec.slug,
          title: spec.title,
          language: spec.language,
          massParts: source.massParts ?? [],
          seasons: [],
          aliases: ["Sequence"],
          lyrics: body,
        },
      });
      console.log(`${spec.title}: added (${body.length} chars)`);
    }

    const date = new Date(`${spec.sunday}T00:00:00.000Z`);
    const plan = await prisma.massPlan.findUnique({ where: { date }, select: { id: true, name: true } });
    if (plan && !dryRun) {
      const { count } = await prisma.massPlanItem.updateMany({
        where: { planId: plan.id, songSlug: "sequence" },
        data: { songSlug: spec.slug, song: spec.title },
      });
      console.log(`   ${plan.name}: ${count} item(s) repointed`);
    }
    written.push({ slug: spec.slug, title: spec.title, language: spec.language, body });
  }

  const left = await prisma.massPlanItem.count({ where: { songSlug: "sequence" } });
  if (left > 0 && !dryRun) throw new Error(`Sequence: ${left} plan item(s) still point at it`);

  if (!dryRun) {
    writeFileSync("/tmp/sequence-original.json", JSON.stringify(source, null, 1));
    await prisma.song.delete({ where: { slug: "sequence" } });
    console.log("Sequence: archived to /tmp/sequence-original.json and removed");
  }
  return written;
}

async function fixSweetSacrament() {
  const song = await prisma.song.findUnique({ where: { slug: "sweet-sacrament-divine" } });
  if (!song) return;
  const parts = blocks(song.lyrics);
  const stray = parts.find((b) => /^organ$/i.test(b.body.replace(/<[^>]+>/g, "").trim()));
  if (!stray) {
    console.log("Sweet Sacrament Divine: already clean");
    return;
  }
  // Keep only the hymn itself; a single heading over one block is noise too.
  const hymn = parts.find((b) => b !== stray);
  const lyrics = hymn.body;
  if (!dryRun) {
    await prisma.song.update({
      where: { slug: "sweet-sacrament-divine" },
      data: {
        lyrics,
        notes: [song.notes, "Communion: organ."].filter(Boolean).join(" "),
      },
    });
  }
  console.log('Sweet Sacrament Divine: "Organ" moved from the lyrics to the notes');
}

async function main() {
  const written = await splitSequence();
  await fixSweetSacrament();
  if (written) {
    writeFileSync("/tmp/sequence-split.json", JSON.stringify(written, null, 1));
    console.log("\nlyrics for the data file written to /tmp/sequence-split.json");
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
