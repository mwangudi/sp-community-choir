import "server-only";

import { prisma } from "@/lib/db";
import type { SongOption } from "@/app/admin/(dashboard)/mass-plans/plan-form";

/**
 * Active songs for the plan form's song picker, with the other titles each is
 * known by — a psalm filed under one Sunday is found from the others too.
 */
export async function songOptions(): Promise<SongOption[]> {
  const rows = await prisma.song.findMany({
    where: { isActive: true },
    select: { slug: true, title: true, aliases: true },
    orderBy: { title: "asc" },
  });
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    aliases: Array.isArray(r.aliases)
      ? r.aliases.filter((a): a is string => typeof a === "string")
      : [],
  }));
}
