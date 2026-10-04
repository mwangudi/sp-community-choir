import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { AnnouncementForm } from "../announcement-form";

export const metadata: Metadata = { title: "Edit announcement" };
export const dynamic = "force-dynamic";

/** `datetime-local` wants local wall-clock time, not an ISO/UTC string. */
function toLocalInput(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("TECHNICAL");
  const { id } = await params;
  const a = await prisma.announcement.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit announcement</Typography>
        <Typography color="text.secondary" noWrap>
          {a.message}
        </Typography>
      </Box>

      <AnnouncementForm
        announcement={{
          id: a.id,
          message: a.message,
          href: a.href ?? "",
          linkLabel: a.linkLabel ?? "",
          startsAt: toLocalInput(a.startsAt),
          endsAt: toLocalInput(a.endsAt),
          isActive: a.isActive,
          sortOrder: a.sortOrder,
        }}
      />
    </Stack>
  );
}
