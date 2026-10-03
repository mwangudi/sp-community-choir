import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { isMassKind } from "@/lib/mass-occasions";
import { PlanForm } from "../../mass-plans/plan-form";

export const metadata: Metadata = { title: "New special Mass" };
export const dynamic = "force-dynamic";

export default async function NewSpecialMassPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requireSession("TECHNICAL");

  const { kind: rawKind = "" } = await searchParams;
  const kind = isMassKind(rawKind) && rawKind !== "SUNDAY" ? rawKind : "REQUIEM";

  const songs = await prisma.song.findMany({
    where: { isActive: true },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">New special Mass</Typography>
        <Typography color="text.secondary">
          Choose the songs for a wedding, requiem or feast on any day.
        </Typography>
      </Box>

      <PlanForm
        songs={songs}
        plan={{
          kind,
          date: "",
          name: "",
          venue: "",
          year: "",
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
