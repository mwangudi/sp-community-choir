import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import type { LiturgicalSeason } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { dateKey, liturgicalContext, type LiturgicalContext } from "@/lib/liturgical";
import { OUTLINES, withTithe } from "@/lib/mass-occasions";
import { songOptions } from "@/lib/server/song-options";
import { PlanForm } from "../plan-form";

export const metadata: Metadata = { title: "New mass plan" };
export const dynamic = "force-dynamic";

const SEASON: Record<LiturgicalContext["season"], LiturgicalSeason> = {
  Advent: "ADVENT",
  Christmas: "CHRISTMAS",
  OrdinaryTime: "ORDINARY_TIME",
  Lent: "LENT",
  Triduum: "TRIDUUM",
  Easter: "EASTER",
};

/** The first Sunday from today that has no plan yet. */
async function nextOpenSunday(): Promise<LiturgicalContext> {
  let ctx = liturgicalContext(new Date());
  for (let i = 0; i < 12; i++) {
    const taken = await prisma.massPlan.findFirst({
      where: { kind: "SUNDAY", date: new Date(`${dateKey(ctx.date)}T00:00:00.000Z`) },
      select: { id: true },
    });
    if (!taken) return ctx;
    const next = new Date(ctx.date);
    next.setDate(next.getDate() + 7);
    ctx = liturgicalContext(next);
  }
  return ctx;
}

export default async function NewMassPlanPage() {
  await requireSession("TECHNICAL");
  const [songs, sunday] = await Promise.all([songOptions(), nextOpenSunday()]);

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">New mass plan</Typography>
        <Typography color="text.secondary">
          Set out in the usual Sunday order for {sunday.name} — pick a song for
          each slot, and add or remove slots as the Sunday needs.
        </Typography>
      </Box>

      <PlanForm
        songs={songs}
        plan={{
          kind: "SUNDAY",
          date: dateKey(sunday.date),
          name: sunday.name,
          venue: "",
          year: sunday.year,
          season: SEASON[sunday.season],
          setting: "",
          leader: "",
          youtubeId: "",
          notes: "",
          status: "DRAFT",
          items: withTithe(OUTLINES.SUNDAY, sunday.date).map((part) => ({ part, song: "", songSlug: null })),
        }}
      />
    </Stack>
  );
}
