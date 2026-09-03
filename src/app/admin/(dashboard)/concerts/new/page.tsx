import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { requireSession } from "@/lib/auth";
import { ConcertForm } from "../concert-form";

export const metadata: Metadata = { title: "New concert" };
export const dynamic = "force-dynamic";

export default async function NewConcertPage() {
  await requireSession("TECHNICAL");

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">New concert</Typography>
        <Typography color="text.secondary">
          Add an event to the public concerts page.
        </Typography>
      </Box>

      <ConcertForm
        concert={{
          slug: "",
          title: "",
          startsAt: "",
          venue: "",
          blurb: "",
          description: "",
          poster: "",
          pinned: false,
          isPublished: true,
          ctaLabel: "",
          ctaHref: "",
        }}
      />
    </Stack>
  );
}
