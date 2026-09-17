"use client";

import { Button, Stack } from "@mui/material";
import { Download, ExternalLink, Printer } from "lucide-react";

export function PrintButton({ planId }: { planId: string }) {
  const pdf = `/admin/worship-aid/${planId}/pdf`;

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Button
        variant="contained"
        startIcon={<Download size={16} />}
        href={`${pdf}?download=1`}
        sx={{ flexShrink: 0 }}
      >
        Download PDF
      </Button>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<ExternalLink size={15} />}
        href={pdf}
        target="_blank"
        rel="noreferrer"
        sx={{ flexShrink: 0 }}
      >
        Open PDF
      </Button>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<Printer size={15} />}
        onClick={() => window.print()}
        sx={{ flexShrink: 0 }}
      >
        Print
      </Button>
    </Stack>
  );
}
