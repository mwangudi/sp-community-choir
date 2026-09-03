import type { Metadata } from "next";
import { Box, Stack, Typography } from "@mui/material";
import { requireSession } from "@/lib/auth";
import { getSettingValues } from "@/lib/server/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Site settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireSession("ADMIN");
  const values = await getSettingValues();

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Site settings</Typography>
        <Typography color="text.secondary">
          Contact details, rehearsal times and payment numbers shown on the
          public site. Leave a field blank to restore its built-in default.
        </Typography>
      </Box>

      <SettingsForm values={values} />
    </Stack>
  );
}
