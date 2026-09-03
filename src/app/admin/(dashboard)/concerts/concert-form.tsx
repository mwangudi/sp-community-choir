"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ImageUp } from "lucide-react";
import { FormActions } from "@/components/admin/form-actions";
import {
  isRequired,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { saveConcert, type ConcertFormState } from "./actions";

export type ConcertDraft = {
  id?: string;
  slug: string;
  title: string;
  startsAt: string;
  venue: string;
  blurb: string;
  description: string;
  poster: string;
  pinned: boolean;
  isPublished: boolean;
  ctaLabel: string;
  ctaHref: string;
};

export function ConcertForm({ concert }: { concert: ConcertDraft }) {
  const [state, formAction, pending] = useActionState<ConcertFormState, FormData>(
    saveConcert,
    {},
  );
  const [posterName, setPosterName] = useState<string | null>(null);
  const { formProps, field } = useFieldValidation({
    title: isRequired("Title"),
    startsAt: isRequired("Start date and time"),
    venue: isRequired("Venue"),
    blurb: isRequired("Blurb"),
  });

  return (
    <form action={formAction} {...formProps}>
      {concert.id && <input type="hidden" name="id" value={concert.id} />}

      {state.error && (
        <Alert severity="error" sx={{ mb: 5 }}>
          {state.error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 6,
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          alignItems: "start",
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 5 }}>
              The concert
            </Typography>
            <Stack spacing={5}>
              <TextField
                name="title"
                label="Title"
                defaultValue={concert.title}
                fullWidth
                {...field("title")}
              />
              <TextField
                name="slug"
                label="URL slug"
                defaultValue={concert.slug}
                helperText="Leave blank to build one from the title."
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                <TextField
                  name="startsAt"
                  label="Starts at"
                  type="datetime-local"
                  defaultValue={concert.startsAt}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...field("startsAt")}
                />
                <TextField
                  name="venue"
                  label="Venue"
                  defaultValue={concert.venue}
                  fullWidth
                  {...field("venue")}
                />
              </Stack>
              <TextField
                name="blurb"
                label="Blurb"
                defaultValue={concert.blurb}
                multiline
                minRows={2}
                fullWidth
                {...field("blurb", "One or two sentences for the listing.")}
              />
              <TextField
                name="description"
                label="Full description"
                defaultValue={concert.description}
                helperText="Leave a blank line between paragraphs."
                multiline
                minRows={6}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Publishing
              </Typography>
              <Stack spacing={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isPublished"
                      defaultChecked={concert.isPublished}
                    />
                  }
                  label="Visible on the website"
                />
                <FormControlLabel
                  control={<Checkbox name="pinned" defaultChecked={concert.pinned} />}
                  label="Pin to the top"
                />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Poster
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<ImageUp size={16} />}
                fullWidth
              >
                {posterName ?? (concert.poster ? "Replace poster" : "Upload a poster")}
                <input
                  hidden
                  type="file"
                  name="posterFile"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => setPosterName(e.target.files?.[0]?.name ?? null)}
                />
              </Button>
              {concert.poster && !posterName && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 3 }}
                >
                  Current: {concert.poster}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Call to action
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="ctaLabel"
                  label="Button label"
                  placeholder="e.g. Reserve a seat"
                  defaultValue={concert.ctaLabel}
                  fullWidth
                />
                <TextField
                  name="ctaHref"
                  label="Button link"
                  defaultValue={concert.ctaHref}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <FormActions
        pending={pending}
        cancelHref="/admin/concerts"
        label="Save concert"
      />
    </form>
  );
}
