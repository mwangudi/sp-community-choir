import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massKindLabel } from "@/lib/mass-occasions";
import { formatDate } from "@/lib/utils";
import { PlanForm } from "../../mass-plans/plan-form";

export const metadata: Metadata = { title: "Edit special Mass" };
export const dynamic = "force-dynamic";

export default async function EditSpecialMassPage({
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
  if (plan.kind === "SUNDAY") redirect(`/admin/mass-plans/${plan.id}`);

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit special Mass</Typography>
        <Typography color="text.secondary">
          {massKindLabel(plan.kind)} · {plan.name} · {formatDate(plan.date)}
        </Typography>
      </Box>

      <PlanForm
        songs={songs}
        plan={{
          id: plan.id,
          kind: plan.kind,
          date: plan.date.toISOString().slice(0, 10),
          name: plan.name,
          venue: plan.venue ?? "",
          year: "",
          season: plan.season ?? "",
          setting: plan.setting ?? "",
          leader: plan.leader ?? "",
          youtubeId: "",
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
