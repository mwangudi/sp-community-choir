import { prisma } from "@/lib/db";
import { type GalleryItem } from "@/lib/gallery";
import { GalleryBrowser } from "./gallery-browser";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const rows = await prisma.galleryItem.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const items: GalleryItem[] = rows.flatMap((row): GalleryItem[] => {
    const tags = Array.isArray(row.tags) ? (row.tags as string[]) : undefined;
    const date = row.takenOn?.toISOString().slice(0, 10);

    if (row.kind === "PHOTO") {
      if (!row.src) return [];
      return [
        {
          kind: "photo" as const,
          slug: row.slug,
          src: row.src,
          alt: row.alt ?? row.title ?? "St. Paul's Chapel Community Choir",
          caption: row.caption ?? undefined,
          date,
          tags,
        },
      ];
    }

    if (!row.youtubeId) return [];
    return [
      {
        kind: "video" as const,
        slug: row.slug,
        youtubeId: row.youtubeId,
        title: row.title ?? "Choir recording",
        caption: row.caption ?? undefined,
        date,
        tags,
      },
    ];
  });

  return <GalleryBrowser items={items} />;
}
