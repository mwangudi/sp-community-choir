import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { requireSession } from "@/lib/auth";
import { MemberForm } from "../member-form";

export const metadata: Metadata = { title: "New member" };
export const dynamic = "force-dynamic";

export default async function NewMemberPage() {
  await requireSession("TECHNICAL");

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Add a member</Typography>
        <Typography color="text.secondary">A new name on the roster.</Typography>
      </Box>

      <MemberForm
        member={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          voice: "",
          jumuiya: "",
          joinedOn: "",
          notes: "",
          isActive: true,
          mediaConsent: false,
        }}
      />
    </Stack>
  );
}
