import "server-only";

import { prisma } from "@/lib/db";
import { CONCERTS, type ChoirConcert } from "@/lib/choir";

function toChoirConcert(row: {
  slug: string;
  title: string;
  startsAt: Date;
  venue: string;
  blurb: string;
  description: unknown;
  poster: string | null;
  pinned: boolean;
  ctaLabel: string | null;
  ctaHref: string | null;
}): ChoirConcert {
  return {
    slug: row.slug,
    title: row.title,
    startsAt: row.startsAt.toISOString(),
    venue: row.venue,
    blurb: row.blurb,
    description: Array.isArray(row.description)
      ? (row.description as string[])
      : undefined,
    poster: row.poster ?? undefined,
    pinned: row.pinned,
    ctaLabel: row.ctaLabel ?? undefined,
    ctaHref: row.ctaHref ?? undefined,
  };
}

/**
 * Published concerts from the admin panel. Falls back to the bundled list so
 * the site still renders before any have been entered, or if the DB is down.
 */
export async function getConcerts(): Promise<ChoirConcert[]> {
  try {
    const rows = await prisma.concert.findMany({
      where: { isPublished: true },
      orderBy: { startsAt: "asc" },
    });
    if (rows.length > 0) return rows.map(toChoirConcert);
  } catch {
    // Fall through to the bundled list.
  }
  return CONCERTS;
}
