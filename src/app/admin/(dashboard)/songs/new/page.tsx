import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { requireSession } from "@/lib/auth";
import { SongForm } from "../song-form";

export const metadata: Metadata = { title: "New song" };
export const dynamic = "force-dynamic";

export default async function NewSongPage() {
  await requireSession("TECHNICAL");

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Add a song</Typography>
        <Typography color="text.secondary">
          A new entry in the choir&apos;s repertoire.
        </Typography>
      </Box>

      <SongForm
        isNew
        song={{
          slug: "",
          title: "",
          language: "ENGLISH",
          composer: "",
          arranger: "",
          voicing: "",
          musicalKey: "",
          aliases: "",
          seasons: [],
          massParts: [],
          themes: "",
          scripture: "",
          driveFolderId: "",
          lyrics: "",
          notes: "",
          isActive: true,
          copyrightStatus: "UNKNOWN",
          rightsHolder: "",
          licenceRef: "",
          sourceUrl: "",
        }}
      />
    </Stack>
  );
}
