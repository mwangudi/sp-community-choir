/**
 * Even out the spacing in a song's lyrics.
 *
 * Most songs hold a verse as one paragraph, its lines split by line breaks.
 * Songs typed with Enter after every line hold each line as a paragraph of
 * its own, so the worship aid spaces every line like a new verse; stray empty
 * paragraphs add gaps on top. This folds runs of one-line paragraphs back into
 * verses and drops the empty ones.
 *
 * A new verse starts at an empty paragraph, a numbered line ("2. …") or one
 * led by a dash ("-- …"), a Chorus or Refrain label, after a psalm's "R." cue, and wherever a bold
 * refrain meets plain text. A
 * movement heading such as <p><strong>Kyrie</strong></p> always stays a
 * paragraph of its own — the worship aid finds each movement by it.
 *
 * Plain string work on the editor's own markup, so the admin editor and
 * scripts/tidy-lyrics.mjs share it. Running it twice changes nothing more.
 */

import { MASS_PLAN_PART_ORDER } from "./mass-plans";

const MOVEMENTS = new Set(MASS_PLAN_PART_ORDER.map((p) => p.toLowerCase()));
const BLOCK = /<(p|h[1-6]|ul|ol|blockquote|pre)\b[^>]*>[\s\S]*?<\/\1>|<hr\s*\/?>/gi;
const BR = /<br\s*\/?>/gi;

type Line = { html: string; bold: boolean; text: string };

const textOf = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&nbsp;| /g, " ").trim();

function line(raw: string): Line {
  const html = raw.replace(/&nbsp;| /g, " ").replace(/\s+/g, " ").trim();
  return {
    html,
    bold: /^<strong>(?:(?!<\/?strong>)[\s\S])*<\/strong>$/.test(html),
    text: textOf(html),
  };
}

const startsVerse = (l: Line) =>
  /^(\d+\s*[.)]|[-–—]{1,2}\s|[-–—]{2}|chorus\b|refrain\b|response\b|r\s*[.:/])/i.test(l.text);
/** A psalm verse closes on the response cue, "… my Saviour. R." */
const endsVerse = (l: Line) => /(^|\s|\.)R\s*\/?\s*\.?$/.test(l.text) && l.text.length > 3;
const isHeading = (l: Line) => l.bold && MOVEMENTS.has(l.text.replace(/:$/, "").toLowerCase());

export function tidyLyrics(html: string): string {
  const source = html.trim();
  if (!/<p[\s>]/i.test(source)) return html;

  const out: string[] = [];
  let verse: Line[] = [];
  const flush = () => {
    if (verse.length) out.push(`<p>${verse.map((l) => l.html).join("<br />")}</p>`);
    verse = [];
  };

  for (const [block, tag] of source.matchAll(BLOCK)) {
    if (tag?.toLowerCase() !== "p") {
      flush();
      out.push(block);
      continue;
    }
    const inner = block.replace(/^<p\b[^>]*>|<\/p>$/gi, "");
    const lines = inner.split(BR).map(line);
    const filled = lines.filter((l) => l.text);

    if (filled.length === 0) {
      flush(); // an empty paragraph: the gap between two verses
    } else if (filled.length === 1 && lines.length === 1) {
      const l = filled[0];
      if (isHeading(l)) {
        flush();
        out.push(`<p><strong>${l.text.replace(/:$/, "")}</strong></p>`);
      } else {
        const last = verse[verse.length - 1];
        if (last && (startsVerse(l) || l.bold !== last.bold)) flush();
        verse.push(l);
        if (endsVerse(l)) flush();
      }
    } else {
      // Already a verse; a blank line inside it splits it in two.
      flush();
      for (const l of lines) {
        if (l.text) verse.push(l);
        else flush();
      }
      flush();
    }
  }
  flush();
  return out.join("");
}
