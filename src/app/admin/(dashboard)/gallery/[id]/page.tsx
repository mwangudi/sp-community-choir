import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { GalleryForm } from "../gallery-form";

export const metadata: Metadata = { title: "Edit gallery item" };
export const dynamic = "force-dynamic";

export default async function EditGalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("TECHNICAL");
  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) notFound();

  const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit gallery item</Typography>
        <Typography color="text.secondary">
          {item.title ?? item.alt ?? item.slug}
        </Typography>
      </Box>

      <GalleryForm
        item={{
          id: item.id,
          slug: item.slug,
          kind: item.kind,
          src: item.src ?? "",
          youtubeId: item.youtubeId ?? "",
          title: item.title ?? "",
          alt: item.alt ?? "",
          caption: item.caption ?? "",
          takenOn: item.takenOn ? item.takenOn.toISOString().slice(0, 10) : "",
          tags: tags.join(", "),
          sortOrder: item.sortOrder,
          isPublished: item.isPublished,
        }}
      />
    </Stack>
  );
}
