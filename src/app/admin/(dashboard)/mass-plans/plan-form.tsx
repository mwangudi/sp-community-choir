"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { FormActions } from "@/components/admin/form-actions";
import {
  isRequired,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { massPartLabel } from "@/lib/mass-parts";
import {
  OCCASION_PARTS,
  OUTLINES,
  SPECIAL_KINDS,
  massKindLabel,
  plansHref,
} from "@/lib/mass-occasions";
import { MASS_PARTS, SEASONS } from "@/lib/validation";
import { saveMassPlan, type PlanFormState } from "./actions";

export type PlanItemDraft = { part: string; song: string; songSlug: string | null };

export type PlanDraft = {
  id?: string;
  kind: string;
  date: string;
  name: string;
  venue: string;
  year: string;
  season: string;
  setting: string;
  leader: string;
  youtubeId: string;
  notes: string;
  status: string;
  items: PlanItemDraft[];
};

export type SongOption = { slug: string; title: string };

export function PlanForm({
  plan,
  songs,
}: {
  plan: PlanDraft;
  songs: SongOption[];
}) {
  const [state, formAction, pending] = useActionState<PlanFormState, FormData>(
    saveMassPlan,
    {},
  );
  const [items, setItems] = useState<PlanItemDraft[]>(plan.items);
  const [kind, setKind] = useState(plan.kind);
  const sunday = kind === "SUNDAY";
  // Wedding and funeral rites have no place on a Sunday.
  const parts = sunday
    ? MASS_PARTS.filter((p) => !OCCASION_PARTS.includes(p))
    : MASS_PARTS;
  const { formProps, field } = useFieldValidation({
    name: isRequired("Name"),
    date: isRequired("Date"),
  });

  const update = (index: number, patch: Partial<PlanItemDraft>) =>
    setItems((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  const move = (index: number, direction: -1 | 1) =>
    setItems((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <form action={formAction} {...formProps}>
      {plan.id && <input type="hidden" name="id" value={plan.id} />}
      {sunday && <input type="hidden" name="kind" value="SUNDAY" />}
      <input type="hidden" name="items" value={JSON.stringify(items)} />

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
        {/* On a phone the details come first; an empty order of service is no place to start. */}
        <Card sx={{ order: { xs: 2, lg: 0 } }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={4}
              sx={{ justifyContent: "space-between", alignItems: "center", mb: 5 }}
            >
              <Typography variant="h6">Order of service</Typography>
              <Stack direction="row" spacing={2}>
                {!sunday && items.length === 0 && (
                  <Button
                    size="small"
                    onClick={() =>
                      setItems(
                        OUTLINES[kind as keyof typeof OUTLINES].map((part) => ({
                          part,
                          song: "",
                          songSlug: null,
                        })),
                      )
                    }
                  >
                    Use the {massKindLabel(kind).toLowerCase()} outline
                  </Button>
                )}
                <Button
                  size="small"
                  startIcon={<Plus size={14} />}
                  onClick={() =>
                    setItems((rows) => [
                      ...rows,
                      { part: "ENTRANCE", song: "", songSlug: null },
                    ])
                  }
                >
                  Add a slot
                </Button>
              </Stack>
            </Stack>

            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No slots yet — add the first one above.
              </Typography>
            ) : (
              <Stack spacing={4}>
                {items.map((item, index) => (
                  <Stack
                    key={index}
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    sx={{ alignItems: { md: "center" } }}
                  >
                    <TextField
                      label="Part"
                      select
                      size="small"
                      value={item.part}
                      onChange={(e) => update(index, { part: e.target.value })}
                      sx={{ minWidth: 210 }}
                    >
                      {parts.map((p) => (
                        <MenuItem key={p} value={p}>
                          {massPartLabel(p)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Autocomplete
                      freeSolo
                      size="small"
                      sx={{ flex: 1 }}
                      options={songs}
                      getOptionLabel={(o) => (typeof o === "string" ? o : o.title)}
                      value={item.song}
                      onInputChange={(_, value, reason) => {
                        if (reason === "input") {
                          update(index, { song: value, songSlug: null });
                        }
                      }}
                      onChange={(_, value) => {
                        if (value && typeof value !== "string") {
                          update(index, { song: value.title, songSlug: value.slug });
                        } else {
                          update(index, { song: value ?? "", songSlug: null });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Song" placeholder="Pick or type" />
                      )}
                    />

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                          >
                            <ArrowUp size={16} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === items.length - 1}
                            onClick={() => move(index, 1)}
                          >
                            <ArrowDown size={16} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setItems((rows) => rows.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Stack spacing={6} sx={{ order: { xs: 1, lg: 0 } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                {sunday ? "The Sunday" : "The occasion"}
              </Typography>
              <Stack spacing={5}>
                {!sunday && (
                  <TextField
                    name="kind"
                    label="Occasion"
                    select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    fullWidth
                  >
                    {SPECIAL_KINDS.map((k) => (
                      <MenuItem key={k} value={k}>
                        {massKindLabel(k)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                <TextField
                  name="name"
                  label="Name"
                  placeholder={
                    sunday
                      ? "e.g. 21st Sunday in Ordinary Time"
                      : "e.g. Requiem Mass for the late Jane Wanjiru"
                  }
                  defaultValue={plan.name}
                  fullWidth
                  {...field("name")}
                />
                <TextField
                  name="date"
                  label="Date"
                  type="date"
                  defaultValue={plan.date}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...field("date")}
                />
                {sunday ? (
                  <TextField
                    name="year"
                    label="Lectionary year"
                    select
                    defaultValue={plan.year}
                    fullWidth
                  >
                    <MenuItem value="">Not set</MenuItem>
                    {["A", "B", "C"].map((y) => (
                      <MenuItem key={y} value={y}>
                        Year {y}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    name="venue"
                    label="Venue"
                    placeholder="Leave blank for the chapel"
                    defaultValue={plan.venue}
                    fullWidth
                  />
                )}
                <TextField
                  name="season"
                  label="Season"
                  select
                  defaultValue={plan.season}
                  fullWidth
                >
                  <MenuItem value="">Not set</MenuItem>
                  {SEASONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {massPartLabel(s)}
                    </MenuItem>
                  ))}
                </TextField>
                {sunday && (
                  <TextField
                    name="status"
                    label="Status"
                    select
                    defaultValue={plan.status}
                    fullWidth
                  >
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="PUBLISHED">Published</MenuItem>
                  </TextField>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Who and how
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="setting"
                  label="Mass setting"
                  defaultValue={plan.setting}
                  fullWidth
                />
                <TextField
                  name="leader"
                  label="Leader"
                  defaultValue={plan.leader}
                  fullWidth
                />
                {sunday && (
                  <TextField
                    name="youtubeId"
                    label="Livestream (YouTube)"
                    placeholder="https://www.youtube.com/watch?v=…"
                    defaultValue={plan.youtubeId}
                    helperText="Paste the link after Mass — visitors can then watch it on the website."
                    fullWidth
                  />
                )}
                <TextField
                  name="notes"
                  label={sunday ? "Notes" : "Dedication"}
                  placeholder={sunday ? undefined : "e.g. In loving memory of …"}
                  helperText="Printed at the foot of the worship aid."
                  defaultValue={plan.notes}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <FormActions
        pending={pending}
        cancelHref={plansHref(kind)}
        label="Save plan"
      />
    </form>
  );
}
