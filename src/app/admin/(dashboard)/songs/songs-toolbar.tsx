"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";

export type Option = { value: string; label: string };

/** Searching on one or two letters matches almost everything, so wait for three. */
const MIN_QUERY = 3;
const DEBOUNCE_MS = 400;

export function SongsToolbar({
  languages,
  rights,
}: {
  languages: Option[];
  rights: Option[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const committed = params.get("q") ?? "";
  const language = params.get("language") ?? "";
  const status = params.get("rights") ?? "";

  const [query, setQuery] = useState(committed);
  const [open, setOpen] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState(language);
  const [draftRights, setDraftRights] = useState(status);

  const activeFilters = (language ? 1 : 0) + (status ? 1 : 0);
  const hasAnything = Boolean(committed || activeFilters);

  const push = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any change to the query or filters invalidates the current page.
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/admin/songs?${qs}` : "/admin/songs");
  };

  // Debounced auto-search once the term is long enough, or when it is cleared.
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

  const openFilters = () => {
    setDraftLanguage(language);
    setDraftRights(status);
    setOpen(true);
  };

  const applyFilters = () => {
    setOpen(false);
    push({ language: draftLanguage, rights: draftRights });
  };

  const clearAll = () => {
    setQuery("");
    skipFirst.current = true;
    router.push("/admin/songs");
  };

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
          placeholder={`Search title or composer — ${MIN_QUERY} letters to start…`}
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

        <Badge badgeContent={activeFilters} color="primary">
          <Button
            type="button"
            onClick={openFilters}
            variant="outlined"
            color="inherit"
            startIcon={<SlidersHorizontal size={16} />}
          >
            Filters
          </Button>
        </Badge>

        {hasAnything && (
          <Button
            type="button"
            onClick={clearAll}
            color="inherit"
            startIcon={<X size={14} />}
          >
            Clear
          </Button>
        )}

        <Button
          component={Link}
          href="/admin/songs/new"
          variant="contained"
          startIcon={<Plus size={16} />}
          sx={{ flexShrink: 0 }}
        >
          Add a song
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Filter the repertoire</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={5} sx={{ pt: 2 }}>
            <TextField
              select
              label="Language"
              value={draftLanguage}
              onChange={(e) => setDraftLanguage(e.target.value)}
              fullWidth
            >
              <MenuItem value="">All languages</MenuItem>
              {languages.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Rights"
              value={draftRights}
              onChange={(e) => setDraftRights(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Any rights status</MenuItem>
              {rights.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 4 }}>
          <Button
            onClick={() => {
              setDraftLanguage("");
              setDraftRights("");
            }}
            color="inherit"
          >
            Reset
          </Button>
          <Button onClick={() => setOpen(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={applyFilters} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
