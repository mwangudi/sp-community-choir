"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";

export type Option = { value: string; label: string };

export type ToolbarFilter = {
  /** Query-string key this filter writes to. */
  name: string;
  label: string;
  anyLabel: string;
  options: Option[];
  multiple?: boolean;
};

/** Searching on one or two letters matches almost everything, so wait for three. */
const MIN_QUERY = 3;
const DEBOUNCE_MS = 400;

const split = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function DataToolbar({
  basePath,
  searchPlaceholder,
  filters,
  createHref,
  createLabel,
  dialogTitle = "Filter",
}: {
  basePath: string;
  searchPlaceholder: string;
  filters: ToolbarFilter[];
  createHref?: string;
  createLabel?: string;
  dialogTitle?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const committed = params.get("q") ?? "";
  const applied = Object.fromEntries(
    filters.map((f) => [f.name, params.get(f.name) ?? ""]),
  );

  const [query, setQuery] = useState(committed);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(applied);

  const activeCount = filters.reduce(
    (n, f) => n + (applied[f.name] ? (f.multiple ? split(applied[f.name]).length : 1) : 0),
    0,
  );
  const hasAnything = Boolean(committed || activeCount);

  const push = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any change to the query or filters invalidates the current page.
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  };

  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const trimmed = query.trim();
    if (trimmed === committed) return;
    if (trimmed.length > 0 && trimmed.length < MIN_QUERY) return;

    const id = setTimeout(() => push({ q: trimmed }), DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
      <Stack
        component="form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          push({ q: query.trim() });
        }}
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        sx={{ p: 4, alignItems: { sm: "center" } }}
      >
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${searchPlaceholder} — ${MIN_QUERY} letters to start…`}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            },
          }}
        />

        {filters.length > 0 && (
          <Badge badgeContent={activeCount} color="primary">
            <Button
              type="button"
              onClick={() => {
                setDraft(applied);
                setOpen(true);
              }}
              variant="outlined"
              color="inherit"
              startIcon={<SlidersHorizontal size={16} />}
            >
              Filters
            </Button>
          </Badge>
        )}

        {hasAnything && (
          <Button
            type="button"
            onClick={() => {
              setQuery("");
              skipFirst.current = true;
              router.push(basePath);
            }}
            color="inherit"
            startIcon={<X size={14} />}
          >
            Clear
          </Button>
        )}

        {createHref && (
          <Button
            component={Link}
            href={createHref}
            variant="contained"
            startIcon={<Plus size={16} />}
            sx={{ flexShrink: 0 }}
          >
            {createLabel ?? "Add"}
          </Button>
        )}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={5} sx={{ pt: 2 }}>
            {filters.map((f) =>
              f.multiple ? (
                <TextField
                  key={f.name}
                  select
                  label={f.label}
                  value={split(draft[f.name] ?? "")}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      [f.name]: (e.target.value as unknown as string[]).join(","),
                    }))
                  }
                  slotProps={{
                    select: {
                      multiple: true,
                      displayEmpty: true,
                      renderValue: (v) => {
                        const picked = v as string[];
                        if (picked.length === 0) return f.anyLabel;
                        return f.options
                          .filter((o) => picked.includes(o.value))
                          .map((o) => o.label)
                          .join(", ");
                      },
                    },
                  }}
                  fullWidth
                >
                  {f.options.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      <Checkbox
                        size="small"
                        checked={split(draft[f.name] ?? "").includes(o.value)}
                      />
                      <ListItemText primary={o.label} />
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  key={f.name}
                  select
                  label={f.label}
                  value={draft[f.name] ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [f.name]: e.target.value }))
                  }
                  fullWidth
                >
                  <MenuItem value="">{f.anyLabel}</MenuItem>
                  {f.options.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              ),
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 4 }}>
          <Button
            onClick={() =>
              setDraft(Object.fromEntries(filters.map((f) => [f.name, ""])))
            }
            color="inherit"
          >
            Reset
          </Button>
          <Button onClick={() => setOpen(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              push(draft);
            }}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
