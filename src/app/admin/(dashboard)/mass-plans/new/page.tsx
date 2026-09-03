import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PlanForm } from "../plan-form";

export const metadata: Metadata = { title: "New mass plan" };
export const dynamic = "force-dynamic";

export default async function NewMassPlanPage() {
  await requireSession("TECHNICAL");
  const songs = await prisma.song.findMany({
    where: { isActive: true },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">New mass plan</Typography>
        <Typography color="text.secondary">
          Build the order of service for a Sunday.
        </Typography>
      </Box>

      <PlanForm
        songs={songs}
        plan={{
          date: "",
          name: "",
          year: "A",
          season: "",
          setting: "",
          leader: "",
          youtubeId: "",
          notes: "",
          status: "DRAFT",
          items: [],
        }}
      />
    </Stack>
  );
}
