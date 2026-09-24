/**
 * Applies hand-typed lyrics from prisma/data/added-lyrics.json.
 *
 *   node scripts/add-lyrics.mjs
 *
 * The worship aid archive does not carry every song, and a Mass setting often
 * reaches us missing a movement. Entries here are kept in the repo and applied
 * after an import, so they survive `import-lyrics.mjs --replace-lyrics`.
 *
 * An entry either replaces a whole song's lyrics, or, when "section" names a
 * Mass part, sets just that movement inside the setting's lyrics.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, "..", "prisma", "data", "added-lyrics.json");

const ORDINARY = [
  "KYRIE",
  "GLORIA",
  "SANCTUS",
  "MYSTERY_OF_FAITH",
  "GREAT_AMEN",
  "AGNUS_DEI",
];

const label = (part) =>
  part
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const toHtml = (verses) =>
  verses
    .map((v) => {
      if (Array.isArray(v)) return `<p>${v.map(escapeHtml).join("<br />")}</p>`;
      // A named block — a second arrangement of the same hymn, say. The name
      // must not be a Mass part, or the worship aid reads it as a movement
      // heading and prints only the block beneath it.
      const body = v.lines.map(escapeHtml).join("<br />");
      return `<p><strong>${escapeHtml(v.label)}</strong></p><p>${body}</p>`;
    })
    .join("");

/** Splits lyrics into the movement sections the worship aid reads. */
function readSections(lyrics) {
  const heading = /<p><strong>([^<]+)<\/strong><\/p>/g;
  const found = [];
  for (let m = heading.exec(lyrics); m; m = heading.exec(lyrics)) {
    if (found.length > 0) found[found.length - 1].end = m.index;
    found.push({
      label: m[1].trim(),
      start: m.index + m[0].length,
      end: lyrics.length,
    });
  }
  return found.map((s) => ({ label: s.label, body: lyrics.slice(s.start, s.end) }));
}

function writeSections(sections) {
  const rank = (l) => {
    const i = ORDINARY.indexOf(l.toUpperCase().replace(/ /g, "_"));
    return i === -1 ? ORDINARY.length : i;
  };
  return sections
    .slice()
    .sort((a, b) => rank(a.label) - rank(b.label))
    .map((s) => `<p><strong>${escapeHtml(s.label)}</strong></p>\n${s.body}`)
    .join("\n");
}

async function main() {
  const entries = JSON.parse(readFileSync(DATA, "utf8"));
  let songsAdded = 0;
  let songsUpdated = 0;
  let sectionsSet = 0;
  let linked = 0;

  for (const entry of entries) {
    const html = toHtml(entry.verses);
    const existing = await prisma.song.findUnique({
      where: { slug: entry.slug },
      select: { slug: true, title: true, lyrics: true },
    });

    if (entry.section) {
      if (!existing) throw new Error(`no song "${entry.slug}" to add a section to`);
      const sections = readSections(existing.lyrics ?? "");
      if (sections.length === 0 && existing.lyrics) {
        throw new Error(
          `"${existing.title}" has unlabelled lyrics; a section cannot be placed safely`,
        );
      }
      const name = label(entry.section);
      const kept = sections.filter((s) => s.label.toLowerCase() !== name.toLowerCase());
      kept.push({ label: name, body: html });
      await prisma.song.update({
        where: { slug: entry.slug },
        data: { lyrics: writeSections(kept) },
      });
      sectionsSet += 1;
      console.log(`${existing.title}: set the ${name}`);
      continue;
    }

    if (existing) {
      await prisma.song.update({
        where: { slug: entry.slug },
        data: {
          lyrics: html,
          ...(entry.title ? { title: entry.title } : {}),
          ...(entry.language ? { language: entry.language } : {}),
          ...(entry.massParts ? { massParts: entry.massParts } : {}),
          ...(entry.aliases ? { aliases: entry.aliases } : {}),
        },
      });
      songsUpdated += 1;
      console.log(`${existing.title}: lyrics replaced`);
    } else {
      await prisma.song.create({
        data: {
          slug: entry.slug,
          title: entry.title,
          language: entry.language ?? "SWAHILI",
          massParts: entry.massParts ?? [],
          seasons: [],
          aliases: entry.aliases ?? [],
          lyrics: html,
        },
      });
      songsAdded += 1;
      console.log(`${entry.title}: added`);
    }

    // Plans list these by name only until the song exists to point at. Prisma
    // drops an undefined filter, which would claim every unlinked item.
    if (entry.title) {
      const { count } = await prisma.massPlanItem.updateMany({
        where: { songSlug: null, song: entry.title },
        data: { songSlug: entry.slug },
      });
      linked += count;
    }
  }

  console.log(
    `\n${songsAdded} added, ${songsUpdated} updated, ${sectionsSet} movements set, ${linked} plan items linked.`,
  );
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
