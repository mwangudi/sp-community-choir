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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ImageUp } from "lucide-react";
import { FormActions } from "@/components/admin/form-actions";
import { saveGalleryItem, type GalleryFormState } from "./actions";

export type GalleryDraft = {
  id?: string;
  slug: string;
  kind: string;
  src: string;
  youtubeId: string;
  title: string;
  alt: string;
  caption: string;
  takenOn: string;
  tags: string;
  sortOrder: number;
  isPublished: boolean;
};

export function GalleryForm({ item }: { item: GalleryDraft }) {
  const [state, formAction, pending] = useActionState<GalleryFormState, FormData>(
    saveGalleryItem,
    {},
  );
  const [kind, setKind] = useState(item.kind);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <form action={formAction}>
      {item.id && <input type="hidden" name="id" value={item.id} />}

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
              The item
            </Typography>
            <Stack spacing={5}>
              <TextField
                name="kind"
                label="Kind"
                select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                fullWidth
              >
                <MenuItem value="PHOTO">Photo</MenuItem>
                <MenuItem value="VIDEO">Video</MenuItem>
              </TextField>

              {kind === "PHOTO" ? (
                <>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<ImageUp size={16} />}
                  >
                    {fileName ?? (item.src ? "Replace photo" : "Upload a photo")}
                    <input
                      hidden
                      type="file"
                      name="imageFile"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                    />
                  </Button>
                  <TextField
                    name="src"
                    label="Or a path already in /public"
                    placeholder="/gallery/pic-1.avif"
                    defaultValue={item.src}
                    fullWidth
                  />
                </>
              ) : (
                <TextField
                  name="youtubeId"
                  label="YouTube id"
                  placeholder="dQw4w9WgXcQ"
                  defaultValue={item.youtubeId}
                  helperText="The 11 characters after ?v= in the video URL"
                  fullWidth
                />
              )}

              <TextField
                name="title"
                label="Title"
                defaultValue={item.title}
                fullWidth
              />
              <TextField
                name="alt"
                label="Alt text"
                defaultValue={item.alt}
                helperText="Describe the picture for screen readers."
                fullWidth
              />
              <TextField
                name="caption"
                label="Caption"
                defaultValue={item.caption}
                multiline
                minRows={2}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Filing
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="slug"
                  label="URL slug"
                  defaultValue={item.slug}
                  helperText="Leave blank to build one from the title."
                  fullWidth
                />
                <TextField
                  name="takenOn"
                  label="Taken on"
                  type="date"
                  defaultValue={item.takenOn}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  name="tags"
                  label="Tags"
                  defaultValue={item.tags}
                  helperText="Comma separated"
                  fullWidth
                />
                <TextField
                  name="sortOrder"
                  label="Sort order"
                  type="number"
                  defaultValue={item.sortOrder}
                  helperText="Lower numbers show first."
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isPublished"
                      defaultChecked={item.isPublished}
                    />
                  }
                  label="Visible on the website"
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <FormActions pending={pending} cancelHref="/admin/gallery" label="Save item" />
    </form>
  );
}
