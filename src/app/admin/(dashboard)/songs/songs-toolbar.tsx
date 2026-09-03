"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { Search, X } from "lucide-react";

export type Option = { value: string; label: string };

export function SongsToolbar({
  languages,
  rights,
}: {
  languages: Option[];
  rights: Option[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const language = params.get("language") ?? "";
  const status = params.get("rights") ?? "";
  const hasFilters = Boolean(query || language || status);

  // Any change to the filters invalidates the current page number.
  const apply = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `/admin/songs?${qs}` : "/admin/songs");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    apply({ q: query });
  };

  return (
    <Stack
      component="form"
      onSubmit={onSubmit}
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      sx={{ p: 4, alignItems: { md: "center" } }}
    >
      <TextField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search title or composer…"
        size="small"
        sx={{ flex: 1, minWidth: 220 }}
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
      <TextField
        select
        label="Language"
        value={language}
        onChange={(event) => apply({ language: event.target.value })}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {languages.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Rights"
        value={status}
        onChange={(event) => apply({ rights: event.target.value })}
        size="small"
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="">All</MenuItem>
        {rights.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>

      <Button type="submit" variant="outlined" size="medium">
        Search
      </Button>
      {hasFilters && (
        <Button
          size="medium"
          color="inherit"
          startIcon={<X size={14} />}
          onClick={() => {
            setQuery("");
            router.push("/admin/songs");
          }}
        >
          Clear
        </Button>
      )}
    </Stack>
  );
}
