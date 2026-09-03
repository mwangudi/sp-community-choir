"use client";

import { Box, Button, Stack } from "@mui/material";
import Link from "next/link";
import { Save } from "lucide-react";

/** Sticky save/cancel bar shared by every admin editor. */
export function FormActions({
  pending,
  cancelHref,
  label = "Save",
}: {
  pending: boolean;
  cancelHref: string;
  label?: string;
}) {
  return (
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        py: 4,
        bgcolor: "background.default",
        zIndex: 1,
      }}
    >
      <Stack direction="row" spacing={3}>
        <Button
          type="submit"
          variant="contained"
          disabled={pending}
          startIcon={<Save size={16} />}
        >
          {pending ? "Saving…" : label}
        </Button>
        <Button component={Link} href={cancelHref} variant="outlined" color="inherit" disabled={pending}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}
