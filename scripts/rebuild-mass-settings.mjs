/**
 * Rebuilds the lyrics of Mass settings so each movement sits under its own
 * heading — Kyrie, Gloria, Sanctus — and the worship aid can find it.
 *
 *   node --env-file=.env scripts/rebuild-mass-settings.mjs [--dry-run]
 *
 * The aid prints a movement by looking for its heading. Older imports headed
 * every section "Another setting", and the merged text in
 * prisma/data/liturgical-songs.json drops movements outright (most Kyries,
 * many Agnus Deis), so the aid printed nothing under Kyrie. The parsed source
 * still holds each movement as a part-tagged variant, one per worship aid it
 * appeared in; this rebuilds the record from those.
 *
 * Where a movement was printed differently over the weeks, the most common
 * text wins: the odd copy usually carries that Sunday's prayer intention or a
 * parsing slip. Ties go to the longer text.
 *
 * Only songs whose stored lyrics lack a heading the aid needs are touched.
 * Safe to re-run, and worth re-running after scripts/import-lyrics.mjs.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, "..", "prisma", "data", "liturgical-songs.json");

/** Liturgical order, with the heading the aid matches on. */
const PARTS = [
  ["ENTRANCE", "Entrance"],
  ["PENITENTIAL", "Penitential"],
  ["KYRIE", "Kyrie"],
  ["GLORIA", "Gloria"],
  ["GOSPEL_PROCESSION", "Gospel Procession"],
  ["RESPONSORIAL_PSALM", "Responsorial Psalm"],
  ["GOSPEL_ACCLAMATION", "Gospel Acclamation"],
  ["CREED", "Creed"],
  ["OFFERTORY", "Offertory"],
  ["PREPARATION_OF_GIFTS", "Preparation of Gifts"],
  ["SANCTUS", "Sanctus"],
  ["MYSTERY_OF_FAITH", "Mystery of Faith"],
  ["GREAT_AMEN", "Great Amen"],
  ["OUR_FATHER", "Our Father"],
  ["SIGN_OF_PEACE", "Sign of Peace"],
  ["AGNUS_DEI", "Agnus Dei"],
  ["COMMUNION", "Communion"],
  ["ANIMA_CHRISTI", "Anima Christi"],
  ["THANKSGIVING", "Thanksgiving"],
  ["RECESSIONAL", "Recessional"],
  ["MARIAN_HYMN", "Marian Hymn"],
];
const LABEL = new Map(PARTS);

/** Movements a Mass setting is made of. */
const SETTING_PARTS = new Set([
  "KYRIE",
  "GLORIA",
  "GOSPEL_ACCLAMATION",
  "SANCTUS",
  "MYSTERY_OF_FAITH",
  "GREAT_AMEN",
  "OUR_FATHER",
  "AGNUS_DEI",
]);

const HEADING = /<p><strong>([^<]+)<\/strong><\/p>/g;

const headings = (html) =>
  new Set([...(html ?? "").matchAll(HEADING)].map((m) => m[1].trim().toLowerCase()));

const plain = (html) =>
  (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();

/** The text this movement was printed with most often. */
function commonest(variants) {
  const tally = new Map();
  for (const v of variants) {
    const key = plain(v.lyrics);
    if (!key) continue;
    const entry = tally.get(key) ?? { count: 0, lyrics: v.lyrics };
    entry.count += 1;
    tally.set(key, entry);
  }
  return [...tally.entries()]
    .sort(([ka, a], [kb, b]) => b.count - a.count || kb.length - ka.length)
    .map(([, e]) => e.lyrics)[0];
}

/** Sections of the merged text that already carry a movement heading. */
function headedSections(html) {
  const byLabel = new Map(PARTS.map(([, label]) => [label.toLowerCase(), label]));
  const found = [];
  for (const m of (html ?? "").matchAll(HEADING)) {
    const label = byLabel.get(m[1].trim().toLowerCase());
    if (found.length > 0) found[found.length - 1].end = m.index;
    found.push({ label, start: m.index + m[0].length, end: html.length });
  }
  const out = new Map();
  for (const s of found) {
    if (s.label && !out.has(s.label)) out.set(s.label, html.slice(s.start, s.end));
  }
  return out;
}

function rebuild(song) {
  // Some movements were only kept in the merged text, not as variants.
  const merged = headedSections(song.lyrics);
  return PARTS.flatMap(([part, label]) => {
    const text = commonest(song.variants.filter((v) => v.part === part)) ?? merged.get(label);
    return text?.trim() ? [`<p><strong>${label}</strong></p>${text.trim()}`] : [];
  }).join("");
}

/** Lines of the current text the rebuild would not carry over. */
function dropped(before, after) {
  const lines = (html) =>
    html
      .replace(HEADING, "")
      .split(/<br \/>|<\/p>|<p>/)
      .map(plain)
      .filter(Boolean);
  // Variants break lines differently, so look for each line anywhere in the text.
  const kept = ` ${lines(after).join(" ")} `;
  return lines(before ?? "").filter((l) => !kept.includes(` ${l} `));
}

async function main() {
  const { songs } = JSON.parse(readFileSync(DATA, "utf8"));

  let rebuilt = 0;
  for (const song of songs) {
    const parts = new Set((song.variants ?? []).map((v) => v.part).filter((p) => LABEL.has(p)));
    // Only a setting holds different texts per part. A hymn sung at Offertory
    // one week and Communion the next is one text, and stays unheaded.
    if ([...parts].filter((p) => SETTING_PARTS.has(p)).length < 2) continue;

    const row = await prisma.song.findUnique({
      where: { slug: song.slug },
      select: { lyrics: true },
    });
    if (!row) continue;

    const have = headings(row.lyrics);
    const missing = [...parts].filter((p) => !have.has(LABEL.get(p).toLowerCase()));
    if (missing.length === 0) continue;

    const next = rebuild(song);
    if (!next || next === row.lyrics) continue;

    const lost = dropped(row.lyrics, next);
    if (lost.length > 0) {
      console.log(`${song.title} — ${lost.length} line(s) of the current text would go:`);
      for (const l of lost) console.log(`     ${l.slice(0, 110)}`);
    }

    if (!dryRun) {
      await prisma.song.update({ where: { slug: song.slug }, data: { lyrics: next } });
    }
    rebuilt += 1;
    console.log(
      `${song.title} — now headed ${[...parts].map((p) => LABEL.get(p)).join(", ")}` +
        ` (was missing ${missing.map((p) => LABEL.get(p)).join(", ")})`,
    );
  }

  console.log(`\n${rebuilt} Mass setting(s)${dryRun ? " would be" : ""} rebuilt.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
