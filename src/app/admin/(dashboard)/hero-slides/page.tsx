import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { SlideGrid } from "@/components/admin/slides/slide-grid";
import { SlideUploader } from "@/components/admin/slides/slide-uploader";

export const metadata: Metadata = { title: "Homepage hero" };
export const dynamic = "force-dynamic";

export default async function HeroSlidesPage() {
  await requireSession("ADMIN");
  const slides = await prisma.slide.findMany({
    where: { placement: "HERO" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Homepage hero</Typography>
        <Typography color="text.secondary">
          The rotating photos beside the welcome text on the homepage. With none
          set up, the site falls back to its built-in photos.
        </Typography>
      </Box>

      <SlideUploader
        placement="HERO"
        hint="Landscape photos work best — the frame is roughly 16:10. JPG, PNG, WebP or AVIF up to 5 MB each."
      />

      <SlideGrid
        slides={slides}
        placement="HERO"
        emptyHint="Upload a few and they will replace the built-in homepage photos."
      />
    </Stack>
  );
}
