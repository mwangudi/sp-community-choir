import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { GalleryForm } from "../gallery-form";

export const metadata: Metadata = { title: "New gallery item" };
export const dynamic = "force-dynamic";

export default async function NewGalleryItemPage() {
  await requireSession("TECHNICAL");
  const last = await prisma.galleryItem.findFirst({ orderBy: { sortOrder: "desc" } });

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Add to the gallery</Typography>
        <Typography color="text.secondary">A photo or a YouTube video.</Typography>
      </Box>

      <GalleryForm
        item={{
          slug: "",
          kind: "PHOTO",
          src: "",
          youtubeId: "",
          title: "",
          alt: "",
          caption: "",
          takenOn: "",
          tags: "",
          sortOrder: (last?.sortOrder ?? -1) + 1,
          isPublished: true,
        }}
      />
    </Stack>
  );
}
