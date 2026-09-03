"use client";

import { Button } from "@mui/material";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button
      variant="contained"
      startIcon={<Printer size={16} />}
      onClick={() => window.print()}
      className="no-print"
    >
      Download PDF
    </Button>
  );
}
