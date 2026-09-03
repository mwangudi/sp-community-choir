"use client";

import { Button, Stack, Typography } from "@mui/material";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: "right" }}>
        In the dialog, set the destination to <strong>Save as PDF</strong> —
        on macOS use the <strong>PDF</strong> menu at the bottom left.
      </Typography>
      <Button
        variant="contained"
        startIcon={<Printer size={16} />}
        onClick={() => window.print()}
        sx={{ flexShrink: 0 }}
      >
        Print / Save as PDF
      </Button>
    </Stack>
  );
}
