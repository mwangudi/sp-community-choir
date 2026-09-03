"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { Pencil } from "lucide-react";
import { updateSlide, type UploadState } from "./actions";

export type SlideDraft = {
  id: string;
  alt: string;
  caption: string;
  kicker: string;
  title: string;
  focus: string;
};

export function SlideEditor({
  slide,
  placement,
}: {
  slide: SlideDraft;
  placement: "LOGIN" | "HERO";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    updateSlide,
    {},
  );
  const isHero = placement === "HERO";

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <>
      <Tooltip title="Edit details">
        <IconButton size="small" onClick={() => setOpen(true)} aria-label="Edit slide">
          <Pencil size={15} />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form action={formAction}>
          <input type="hidden" name="id" value={slide.id} />
          <input type="hidden" name="placement" value={placement} />
          <DialogTitle>Slide details</DialogTitle>
          <DialogContent>
            {state.error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {state.error}
              </Alert>
            )}
            <Stack spacing={5} sx={{ mt: 2 }}>
              {isHero && (
                <>
                  <TextField
                    name="kicker"
                    label="Kicker"
                    defaultValue={slide.kicker}
                    fullWidth
                  />
                  <TextField
                    name="title"
                    label="Headline"
                    defaultValue={slide.title}
                    fullWidth
                  />
                </>
              )}
              <TextField
                name="caption"
                label="Caption"
                defaultValue={slide.caption}
                fullWidth
              />
              <TextField
                name="alt"
                label="Alt text"
                defaultValue={slide.alt}
                fullWidth
              />
              {isHero && (
                <TextField
                  name="focus"
                  label="Focus point"
                  placeholder="center 30%"
                  defaultValue={slide.focus}
                  helperText="CSS object-position — nudge this if heads get cropped."
                  fullWidth
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 6, pb: 5 }}>
            <Button color="inherit" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
