import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ConcertForm } from "../concert-form";

export const metadata: Metadata = { title: "Edit concert" };
export const dynamic = "force-dynamic";

/** `datetime-local` wants local wall-clock time, not an ISO/UTC string. */
function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditConcertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("TECHNICAL");
  const { id } = await params;
  const concert = await prisma.concert.findUnique({ where: { id } });
  if (!concert) notFound();

  const description = Array.isArray(concert.description)
    ? (concert.description as string[])
    : [];

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit concert</Typography>
        <Typography color="text.secondary">{concert.title}</Typography>
      </Box>

      <ConcertForm
        concert={{
          id: concert.id,
          slug: concert.slug,
          title: concert.title,
          startsAt: toLocalInput(concert.startsAt),
          venue: concert.venue,
          blurb: concert.blurb,
          description: description.join("\n\n"),
          poster: concert.poster ?? "",
          pinned: concert.pinned,
          isPublished: concert.isPublished,
          ctaLabel: concert.ctaLabel ?? "",
          ctaHref: concert.ctaHref ?? "",
        }}
      />
    </Stack>
  );
}
