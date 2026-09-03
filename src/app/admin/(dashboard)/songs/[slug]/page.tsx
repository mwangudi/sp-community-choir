import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { SongForm } from "../song-form";

export const metadata: Metadata = { title: "Edit song" };
export const dynamic = "force-dynamic";

const asList = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSession("TECHNICAL");
  const { slug } = await params;
  const song = await prisma.song.findUnique({ where: { slug } });
  if (!song) notFound();

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Edit song</Typography>
        <Typography color="text.secondary">{song.title}</Typography>
      </Box>

      <SongForm
        isNew={false}
        song={{
          slug: song.slug,
          title: song.title,
          language: song.language,
          composer: song.composer ?? "",
          arranger: song.arranger ?? "",
          voicing: song.voicing ?? "",
          musicalKey: song.musicalKey ?? "",
          aliases: asList(song.aliases).join(", "),
          seasons: asList(song.seasons),
          massParts: asList(song.massParts),
          themes: asList(song.themes).join(", "),
          scripture: asList(song.scripture).join(", "),
          driveFolderId: song.driveFolderId ?? "",
          notes: song.notes ?? "",
          isActive: song.isActive,
          copyrightStatus: song.copyrightStatus,
          rightsHolder: song.rightsHolder ?? "",
          licenceRef: song.licenceRef ?? "",
          sourceUrl: song.sourceUrl ?? "",
        }}
      />
    </Stack>
  );
}
