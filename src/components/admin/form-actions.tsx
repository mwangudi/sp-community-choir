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
        zIndex: 1,
        py: 4,
        // Run edge to edge across the page padding, so fields scrolling
        // underneath never show at the sides, with a soft edge above.
        mx: "-24px",
        px: "24px",
        bgcolor: "background.default",
        boxShadow: "0 -6px 12px -10px rgba(0, 0, 0, 0.25)",
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
