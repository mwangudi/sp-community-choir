import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { deleteSong } from "../actions";
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Edit song</Typography>
          <Typography color="text.secondary">{song.title}</Typography>
        </Box>
        {/* Kept off the list so a slip of the mouse cannot remove a song. */}
        <ConfirmDelete
          action={deleteSong}
          id={song.slug}
          name={song.title}
          label="Delete song"
          note="The song is removed from the repertoire. Mass plans that name it keep the text but lose the link."
        />
      </Stack>

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
          lyrics: song.lyrics ?? "",
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
