"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormActions } from "@/components/admin/form-actions";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  isRequired,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { massPartLabel } from "@/lib/mass-parts";
import { rightsLabel } from "@/lib/rights-labels";
import {
  COPYRIGHT_STATUSES,
  LANGUAGES,
  MASS_PARTS,
  SEASONS,
} from "@/lib/validation";
import { saveSong, type SongFormState } from "./actions";

export type SongDraft = {
  slug: string;
  title: string;
  language: string;
  composer: string;
  arranger: string;
  voicing: string;
  musicalKey: string;
  aliases: string;
  seasons: string[];
  massParts: string[];
  themes: string;
  scripture: string;
  driveFolderId: string;
  lyrics: string;
  notes: string;
  isActive: boolean;
  copyrightStatus: string;
  rightsHolder: string;
  licenceRef: string;
  sourceUrl: string;
};

export function SongForm({ song, isNew }: { song: SongDraft; isNew: boolean }) {
  const [state, formAction, pending] = useActionState<SongFormState, FormData>(
    saveSong,
    {},
  );
  const [seasons, setSeasons] = useState<string[]>(song.seasons);
  const [massParts, setMassParts] = useState<string[]>(song.massParts);
  const { formProps, field } = useFieldValidation({
    title: isRequired("Title"),
  });

  return (
    <form action={formAction} {...formProps}>
      {!isNew && <input type="hidden" name="originalSlug" value={song.slug} />}
      <input type="hidden" name="seasons" value={seasons.join(",")} />
      <input type="hidden" name="massParts" value={massParts.join(",")} />

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
        <Stack spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                The song
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="title"
                  label="Title"
                  defaultValue={song.title}
                  fullWidth
                  {...field("title")}
                />
                <TextField
                  name="slug"
                  label="URL slug"
                  defaultValue={song.slug}
                  helperText={
                    isNew
                      ? "Leave blank to build one from the title."
                      : "Changing this changes the public link to the song."
                  }
                  fullWidth
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                  <TextField
                    name="language"
                    label="Language"
                    select
                    defaultValue={song.language}
                    fullWidth
                  >
                    {LANGUAGES.map((l) => (
                      <MenuItem key={l} value={l}>
                        {massPartLabel(l)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    name="musicalKey"
                    label="Key"
                    placeholder="e.g. F major"
                    defaultValue={song.musicalKey}
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                  <TextField
                    name="composer"
                    label="Composer"
                    defaultValue={song.composer}
                    fullWidth
                  />
                  <TextField
                    name="arranger"
                    label="Arranger"
                    defaultValue={song.arranger}
                    fullWidth
                  />
                </Stack>
                <TextField
                  name="voicing"
                  label="Voicing"
                  placeholder="e.g. SATB"
                  defaultValue={song.voicing}
                  fullWidth
                />
                <TextField
                  name="notes"
                  label="Notes"
                  defaultValue={song.notes}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6">Lyrics</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                The full text as sung. Number each verse and keep the
                leader/response markers — this is what the Sunday worship aid is
                built from. Add any translation as the last line.
              </Typography>
              <RichTextEditor
                name="lyrics"
                defaultValue={song.lyrics}
                placeholder={"1. First line of the verse…"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Where it is sung
              </Typography>
              <Stack spacing={5}>
                <TextField
                  label="Seasons"
                  select
                  value={seasons}
                  onChange={(e) =>
                    setSeasons(e.target.value as unknown as string[])
                  }
                  slotProps={{
                    select: {
                      multiple: true,
                      renderValue: (v) =>
                        (v as string[]).map(massPartLabel).join(", "),
                    },
                  }}
                  fullWidth
                >
                  {SEASONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      <Checkbox size="small" checked={seasons.includes(s)} />
                      <ListItemText primary={massPartLabel(s)} />
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Mass parts"
                  select
                  value={massParts}
                  onChange={(e) =>
                    setMassParts(e.target.value as unknown as string[])
                  }
                  slotProps={{
                    select: {
                      multiple: true,
                      renderValue: (v) =>
                        (v as string[]).map(massPartLabel).join(", "),
                    },
                  }}
                  fullWidth
                >
                  {MASS_PARTS.map((p) => (
                    <MenuItem key={p} value={p}>
                      <Checkbox size="small" checked={massParts.includes(p)} />
                      <ListItemText primary={massPartLabel(p)} />
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="themes"
                  label="Themes"
                  defaultValue={song.themes}
                  helperText="Comma separated — e.g. mercy, thanksgiving"
                  fullWidth
                />
                <TextField
                  name="scripture"
                  label="Scripture"
                  defaultValue={song.scripture}
                  helperText="Comma separated — e.g. Ps 23, Jn 6:35"
                  fullWidth
                />
                <TextField
                  name="aliases"
                  label="Also known as"
                  defaultValue={song.aliases}
                  helperText="Comma separated alternative titles"
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Rights
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="copyrightStatus"
                  label="Copyright status"
                  select
                  defaultValue={song.copyrightStatus}
                  fullWidth
                >
                  {COPYRIGHT_STATUSES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {rightsLabel(c)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="rightsHolder"
                  label="Rights holder"
                  defaultValue={song.rightsHolder}
                  fullWidth
                />
                <TextField
                  name="licenceRef"
                  label="Licence reference"
                  defaultValue={song.licenceRef}
                  fullWidth
                />
                <TextField
                  name="sourceUrl"
                  label="Source URL"
                  type="url"
                  defaultValue={song.sourceUrl}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  Anything other than “rights not yet confirmed” is stamped with
                  today&apos;s date as the last rights check.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Files &amp; visibility
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="driveFolderId"
                  label="Drive folder id"
                  defaultValue={song.driveFolderId}
                  helperText="Where the scores and MIDI files live"
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Checkbox name="isActive" defaultChecked={song.isActive} />
                  }
                  label="In the active repertoire"
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <FormActions pending={pending} cancelHref="/admin/songs" label="Save song" />
    </form>
  );
}
