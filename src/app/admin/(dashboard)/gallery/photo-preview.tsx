"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Expand, X } from "lucide-react";

export function PhotoPreview({
  src,
  alt,
  title,
  caption,
  takenOn,
}: {
  src: string;
  alt: string;
  title: string;
  caption?: string | null;
  takenOn?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Preview">
        <IconButton size="small" onClick={() => setOpen(true)} aria-label={`Preview ${title}`}>
          <Expand size={16} />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, position: "relative", bgcolor: "common.black" }}>
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Close preview"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              color: "common.white",
              bgcolor: "rgb(0 0 0 / 0.4)",
              "&:hover": { bgcolor: "rgb(0 0 0 / 0.6)" },
            }}
          >
            <X size={18} />
          </IconButton>

          <Box sx={{ position: "relative", width: "100%", height: "72vh" }}>
            <Image src={src} alt={alt} fill sizes="100vw" style={{ objectFit: "contain" }} />
          </Box>

          <Stack spacing={1} sx={{ p: 5, bgcolor: "background.paper" }}>
            <Typography variant="h6">{title}</Typography>
            {caption && (
              <Typography variant="body2" color="text.secondary">
                {caption}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled">
              {src}
              {takenOn ? ` · ${takenOn}` : ""}
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
