import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { requireSession } from "@/lib/auth";
import { AnnouncementForm } from "../announcement-form";

export const metadata: Metadata = { title: "New announcement" };
export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  await requireSession("TECHNICAL");

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">New announcement</Typography>
        <Typography color="text.secondary">
          Add a line to the news banner under the website&apos;s menu.
        </Typography>
      </Box>

      <AnnouncementForm
        announcement={{
          message: "",
          href: "",
          linkLabel: "",
          startsAt: "",
          endsAt: "",
          isActive: true,
          sortOrder: 0,
        }}
      />
    </Stack>
  );
}
