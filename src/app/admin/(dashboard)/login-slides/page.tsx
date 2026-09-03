import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { SlideGrid } from "@/components/admin/slides/slide-grid";
import { SlideUploader } from "@/components/admin/slides/slide-uploader";

export const metadata: Metadata = { title: "Login carousel" };
export const dynamic = "force-dynamic";

export default async function LoginSlidesPage() {
  await requireSession("ADMIN");
  const slides = await prisma.slide.findMany({
    where: { placement: "LOGIN" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Login carousel</Typography>
        <Typography color="text.secondary">
          Photos shown beside the admin sign-in form.
        </Typography>
      </Box>

      <SlideUploader
        placement="LOGIN"
        hint="JPG, PNG, WebP or AVIF up to 5 MB each. Landscape photos work best."
      />

      <SlideGrid
        slides={slides}
        placement="LOGIN"
        emptyHint="Upload a few and they will rotate on the sign-in page."
      />
    </Stack>
  );
}
