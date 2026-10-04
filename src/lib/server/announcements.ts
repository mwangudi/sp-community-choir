import "server-only";

import { prisma } from "@/lib/db";

export type Announcement = {
  id: string;
  message: string;
  href: string | null;
  linkLabel: string | null;
};

/** Announcements switched on and inside their dates, in the admin's order. */
export async function getLiveAnnouncements(): Promise<Announcement[]> {
  const now = new Date();
  try {
    return await prisma.announcement.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, message: true, href: true, linkLabel: true },
    });
  } catch {
    // A banner is never worth a broken page.
    return [];
  }
}
