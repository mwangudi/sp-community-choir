import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { requireSession } from "@/lib/auth";
import { UserForm } from "../user-form";

export const metadata: Metadata = { title: "New user" };
export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requireSession("ADMIN");

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Add a user</Typography>
        <Typography color="text.secondary">
          Someone who needs to sign in to the admin.
        </Typography>
      </Box>

      <UserForm
        isSelf={false}
        user={{
          name: "",
          email: "",
          role: "TECHNICAL",
          voice: "",
          isActive: true,
        }}
      />
    </Stack>
  );
}
