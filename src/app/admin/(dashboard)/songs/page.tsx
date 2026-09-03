import type { Metadata } from "next";
import Link from "next/link";
import type { CopyrightStatus, Prisma, SongLanguage } from "@prisma/client";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import { Music2, Pencil, Plus, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { massPartLabel } from "@/lib/mass-parts";
import { deleteSong } from "./actions";
import { SongsToolbar } from "./songs-toolbar";

export const metadata: Metadata = { title: "Repertoire" };
export const dynamic = "force-dynamic";

const PER_PAGE = 15;

const RIGHTS_COLOR: Record<CopyrightStatus, "success" | "info" | "error" | "warning"> = {
  PUBLIC_DOMAIN: "success",
  LICENSED: "info",
  COPYRIGHTED: "error",
  UNKNOWN: "warning",
};

const LANGUAGES: SongLanguage[] = [
  "ENGLISH",
  "SWAHILI",
  "LATIN",
  "MALAGASY",
  "OTHER",
];

const RIGHTS: CopyrightStatus[] = [
  "PUBLIC_DOMAIN",
  "LICENSED",
  "COPYRIGHTED",
  "UNKNOWN",
];

type SortKey = "title" | "composer" | "language" | "copyrightStatus";

const SORT_KEYS: SortKey[] = ["title", "composer", "language", "copyrightStatus"];

const COLUMNS: { key: SortKey | "massParts"; label: string; sortable: boolean }[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "composer", label: "Composer", sortable: true },
  { key: "language", label: "Language", sortable: true },
  { key: "massParts", label: "Mass parts", sortable: false },
  { key: "copyrightStatus", label: "Rights", sortable: true },
];

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    language?: string;
    rights?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}) {
  await requireSession("TECHNICAL");

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const language = LANGUAGES.includes(sp.language as SongLanguage)
    ? (sp.language as SongLanguage)
    : undefined;
  const rights = RIGHTS.includes(sp.rights as CopyrightStatus)
    ? (sp.rights as CopyrightStatus)
    : undefined;
  const sort: SortKey = SORT_KEYS.includes(sp.sort as SortKey)
    ? (sp.sort as SortKey)
    : "title";
  const dir: "asc" | "desc" = sp.dir === "desc" ? "desc" : "asc";

  // MySQL's utf8mb4_unicode_ci collation already makes `contains` case-insensitive.
  const where: Prisma.SongWhereInput = {
    ...(language ? { language } : {}),
    ...(rights ? { copyrightStatus: rights } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { composer: { contains: q } },
            { arranger: { contains: q } },
          ],
        }
      : {}),
  };

  const total = await prisma.song.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), pageCount);

  const [songs, catalogue, unknown] = await Promise.all([
    prisma.song.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.song.count(),
    prisma.song.count({ where: { copyrightStatus: "UNKNOWN" } }),
  ]);

  const filtered = Boolean(q || language || rights);

  const sortHref = (key: SortKey) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (language) next.set("language", language);
    if (rights) next.set("rights", rights);
    next.set("sort", key);
    // Clicking the active column flips direction; a new column starts ascending.
    next.set("dir", sort === key && dir === "asc" ? "desc" : "asc");
    return `/admin/songs?${next.toString()}`;
  };

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Repertoire</Typography>
          <Typography color="text.secondary">
            {catalogue} songs in the catalogue.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/songs/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          Add a song
        </Button>
      </Stack>

      {unknown > 0 && (
        <Alert severity="warning" icon={<ShieldAlert size={22} />}>
          <AlertTitle sx={{ fontWeight: 500 }}>
            {unknown} song{unknown === 1 ? "" : "s"} need a copyright check
          </AlertTitle>
          Their scores stay members-only until the rights are confirmed.
        </Alert>
      )}

      <Card>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{
            px: 4,
            pt: 4,
            alignItems: { md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box
              sx={{ width: 3, height: 20, borderRadius: 1, bgcolor: "secondary.main" }}
            />
            <Typography sx={{ fontWeight: 600 }}>All songs</Typography>
          </Stack>
          <Chip
            size="small"
            label={`${total} record${total === 1 ? "" : "s"}`}
            variant="outlined"
          />
        </Stack>

        <SongsToolbar
          languages={LANGUAGES.map((v) => ({ value: v, label: massPartLabel(v) }))}
          rights={RIGHTS.map((v) => ({ value: v, label: massPartLabel(v) }))}
        />
        <Divider />

        {songs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Music2 size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 2, fontWeight: 600 }}>
              {filtered ? "No songs match those filters" : "No songs yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filtered
                ? "Try a different search or clear the filters."
                : "Add the first song to start the catalogue."}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: "#16324F",
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      borderBottom: 0,
                    },
                    // Sort labels carry their own colour, so force them light.
                    "& .MuiTableSortLabel-root, & .MuiTableSortLabel-root:hover, & .MuiTableSortLabel-root.Mui-active":
                      { color: "#fff" },
                    "& .MuiTableSortLabel-icon": { color: "#FDB321 !important" },
                  }}
                >
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      {col.sortable ? (
                        <TableSortLabel
                          component={Link}
                          href={sortHref(col.key as SortKey)}
                          active={sort === col.key}
                          direction={sort === col.key ? dir : "asc"}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& tr:nth-of-type(even)": { bgcolor: "action.hover" },
                  "& td": { borderBottom: "none", py: 1.5 },
                }}
              >
                {songs.map((song) => {
                  const parts = Array.isArray(song.massParts)
                    ? (song.massParts as string[])
                    : [];
                  return (
                    <TableRow key={song.slug} hover>
                      <TableCell>
                        <Typography
                          component={Link}
                          href={`/admin/songs/${song.slug}`}
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            textDecoration: "none",
                            "&:hover": { color: "primary.main" },
                          }}
                        >
                          {song.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>
                        {song.composer ?? "—"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {massPartLabel(song.language)}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                          {parts.slice(0, 3).map((p) => (
                            <Chip
                              key={p}
                              size="small"
                              variant="outlined"
                              label={massPartLabel(p)}
                            />
                          ))}
                          {parts.length > 3 && (
                            <Tooltip title={parts.slice(3).map(massPartLabel).join(", ")}>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`+${parts.length - 3}`}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={massPartLabel(song.copyrightStatus)}
                          sx={{
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            color: `${RIGHTS_COLOR[song.copyrightStatus]}.main`,
                            backgroundColor: `rgb(var(--mui-palette-${
                              RIGHTS_COLOR[song.copyrightStatus]
                            }-mainChannel) / 0.16)`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              component={Link}
                              href={`/admin/songs/${song.slug}`}
                              aria-label={`Edit ${song.title}`}
                            >
                              <Pencil size={16} />
                            </IconButton>
                          </Tooltip>
                          <ConfirmDelete
                            action={deleteSong}
                            id={song.slug}
                            name={song.title}
                            note="The song is removed from the repertoire. Mass plans that name it keep the text but lose the link."
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {songs.length > 0 && (
        <PaginationBar
          page={page}
          pageCount={pageCount}
          total={total}
          shown={songs.length}
          basePath="/admin/songs"
          params={{
            q: q || undefined,
            language,
            rights,
            sort: sort === "title" ? undefined : sort,
            dir: dir === "asc" ? undefined : dir,
          }}
          label="songs"
        />
      )}
    </Stack>
  );
}
