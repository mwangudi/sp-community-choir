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
import { MASS_PARTS, SEASONS } from "@/lib/validation";
import { saveMassPlan, type PlanFormState } from "./actions";

export type PlanItemDraft = { part: string; song: string; songSlug: string | null };

export type PlanDraft = {
  id?: string;
  date: string;
  name: string;
  year: string;
  season: string;
  setting: string;
  leader: string;
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
        <Card>
          <CardContent>
            <Stack
              direction="row"
              spacing={4}
              sx={{ justifyContent: "space-between", alignItems: "center", mb: 5 }}
            >
              <Typography variant="h6">Order of service</Typography>
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
                      {MASS_PARTS.map((p) => (
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

        <Stack spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                The Sunday
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="name"
                  label="Name"
                  placeholder="e.g. 21st Sunday in Ordinary Time"
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
                <TextField
                  name="year"
                  label="Lectionary year"
                  select
                  defaultValue={plan.year}
                  fullWidth
                >
                  {["A", "B", "C"].map((y) => (
                    <MenuItem key={y} value={y}>
                      Year {y}
                    </MenuItem>
                  ))}
                </TextField>
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
                <TextField
                  name="notes"
                  label="Notes"
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
        cancelHref="/admin/mass-plans"
        label="Save plan"
      />
    </form>
  );
}
