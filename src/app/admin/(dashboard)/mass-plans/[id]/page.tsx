import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { PlanForm } from "../plan-form";

export const metadata: Metadata = { title: "Edit mass plan" };
export const dynamic = "force-dynamic";

export default async function EditMassPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("TECHNICAL");
  const { id } = await params;

  const [plan, songs] = await Promise.all([
    prisma.massPlan.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.song.findMany({
      where: { isActive: true },
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!plan) notFound();

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit mass plan</Typography>
        <Typography color="text.secondary">
          {plan.name} · {formatDate(plan.date)}
        </Typography>
      </Box>

      <PlanForm
        songs={songs}
        plan={{
          id: plan.id,
          date: plan.date.toISOString().slice(0, 10),
          name: plan.name,
          year: plan.year,
          season: plan.season ?? "",
          setting: plan.setting ?? "",
          leader: plan.leader ?? "",
          notes: plan.notes ?? "",
          status: plan.status,
          items: plan.items.map((i) => ({
            part: i.part,
            song: i.song,
            songSlug: i.songSlug,
          })),
        }}
      />
    </Stack>
  );
}
