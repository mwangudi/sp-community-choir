/**
 * Repairs songs that hold several settings under one movement heading.
 *
 *   node scripts/fix-repeated-movements.mjs [--dry-run]
 *
 * The worship aid prints a movement by slicing the lyrics from its heading to
 * the next heading, so where a record carries two blocks both headed, say,
 * "Responsorial Psalm", only the first is ever printed and the rest are lost
 * to the congregation. Renaming the later headings to something that is not a
 * movement name keeps them with the first block, so the whole of the song
 * reaches the page and the cantor can choose.
 *
 * The lyrics themselves are never touched beyond the headings and stray lines
 * left by the import, and the run aborts if a single line would be dropped.
 *
 * Safe to re-run: a heading is renamed only while it still repeats.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const MOVEMENTS = new Set([
  "entrance", "penitential", "kyrie", "gloria", "gospel procession",
  "responsorial psalm", "gospel acclamation", "creed", "offertory",
  "preparation of gifts", "sanctus", "mystery of faith", "great amen",
  "our father", "sign of peace", "agnus dei", "communion", "anima christi",
  "thanksgiving", "recessional", "marian hymn",
]);

const HEADING = /<p><strong>([^<]+)<\/strong><\/p>/g;

/** Lyrics as the reader sees them, so nothing can go missing unnoticed. */
const spoken = (html) =>
  html
    .replace(HEADING, "")
    .replace(/<br \/>/g, "\n")
    .replace(/<\/p>\s*<p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== ".");

function repeatedMovements(lyrics) {
  const seen = [];
  for (let m = HEADING.exec(lyrics); m; m = HEADING.exec(lyrics)) {
    seen.push(m[1].trim().toLowerCase());
  }
  HEADING.lastIndex = 0;
  return seen.filter((l, i) => MOVEMENTS.has(l) && seen.indexOf(l) !== i);
}

/** Renames every repeat of a movement heading, keeping the first as it is. */
function renameRepeats(lyrics) {
  const count = new Map();
  return lyrics.replace(HEADING, (whole, raw) => {
    const label = raw.trim();
    const k = label.toLowerCase();
    if (!MOVEMENTS.has(k)) return whole;
    const n = (count.get(k) ?? 0) + 1;
    count.set(k, n);
    if (n === 1) return whole;
    const suffix = n === 2 ? "alternative setting" : `alternative setting ${n - 1}`;
    return `<p><strong>${label} — ${suffix}</strong></p>`;
  });
}

const STRAY_STOP = /<p>\s*\.\s*<\/p>|<br \/>\s*\.\s*<br \/>|<p>\s*\.\s*<br \/>/;

/** Drops the lone full stops the import left between verses. */
const dropStrayStops = (lyrics) =>
  lyrics
    .replace(/<p>\s*\.\s*<\/p>/g, "")
    .replace(/<br \/>\s*\.\s*(?=<br \/>)/g, "")
    .replace(/(<p>)\s*\.\s*<br \/>/g, "$1");

async function main() {
  const songs = await prisma.song.findMany({
    where: { lyrics: { not: null } },
    select: { slug: true, title: true, lyrics: true },
  });

  let fixed = 0;
  for (const song of songs) {
    const repeats = repeatedMovements(song.lyrics);
    const stops = STRAY_STOP.test(song.lyrics);
    if (repeats.length === 0 && !stops) continue;

    const next = dropStrayStops(renameRepeats(song.lyrics));
    if (next === song.lyrics) continue;

    const before = spoken(song.lyrics);
    const after = spoken(next);
    if (before.length !== after.length || before.some((l, i) => l !== after[i])) {
      throw new Error(
        `${song.title}: the text changed, not just the headings — refusing to write`,
      );
    }

    if (!dryRun) {
      await prisma.song.update({ where: { slug: song.slug }, data: { lyrics: next } });
    }
    fixed += 1;
    const what = [
      repeats.length > 0 ? `${repeats.length} repeated heading(s): ${[...new Set(repeats)].join(", ")}` : null,
      stops ? "stray full stops" : null,
    ].filter(Boolean);
    console.log(`${song.title} — ${what.join("; ")}`);
  }

  console.log(`\n${fixed} song(s) ${dryRun ? "would be" : ""} repaired.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
