"use client";

import { useActionState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Upload } from "lucide-react";
import { uploadSlides, type UploadState } from "./actions";

export function SlideUploader({
  placement,
  hint,
}: {
  placement: "LOGIN" | "HERO";
  hint: string;
}) {
  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    uploadSlides,
    {},
  );
  const isHero = placement === "HERO";

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Add photos</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {hint}
        </Typography>

        {state.error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {state.error}
          </Alert>
        )}
        {state.ok && (
          <Alert severity="success" sx={{ mb: 4 }}>
            Photos added to the carousel.
          </Alert>
        )}

        <form action={formAction}>
          <input type="hidden" name="placement" value={placement} />
          <Stack spacing={5}>
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<Upload size={16} />}
              >
                Choose images
                <input
                  type="file"
                  name="files"
                  hidden
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                />
              </Button>
            </Box>

            {isHero && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                <TextField
                  name="kicker"
                  label="Kicker (optional)"
                  placeholder="e.g. Sunday Mass"
                  helperText="Small gold line above the headline."
                  fullWidth
                />
                <TextField
                  name="title"
                  label="Headline (optional)"
                  placeholder="e.g. Sing to the Lord a new song"
                  fullWidth
                />
              </Stack>
            )}

            <TextField
              name="caption"
              label="Caption (optional)"
              placeholder="e.g. Christmas carols at the chapel"
              fullWidth
            />
            <TextField
              name="alt"
              label="Alt text (optional)"
              placeholder="e.g. The choir singing at Sunday Mass"
              fullWidth
            />

            {isHero && (
              <TextField
                name="focus"
                label="Focus point (optional)"
                placeholder="center 30%"
                helperText="CSS object-position — nudge this if heads get cropped."
                fullWidth
              />
            )}

            <Box>
              <Button type="submit" variant="contained" disabled={pending}>
                {pending ? "Uploading…" : "Upload"}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
