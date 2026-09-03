import type { Metadata } from "next";
import Link from "next/link";
import type { CopyrightStatus } from "@prisma/client";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Pencil, Plus, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { deleteSong } from "./actions";
import { massPartLabel } from "@/lib/mass-parts";

export const metadata: Metadata = { title: "Repertoire" };
export const dynamic = "force-dynamic";

const RIGHTS_COLOR: Record<CopyrightStatus, "success" | "info" | "error" | "warning"> = {
  PUBLIC_DOMAIN: "success",
  LICENSED: "info",
  COPYRIGHTED: "error",
  UNKNOWN: "warning",
};

export default async function SongsPage() {
  await requireSession("TECHNICAL");
  const [songs, unknown] = await Promise.all([
    prisma.song.findMany({ orderBy: { title: "asc" }, take: 300 }),
    prisma.song.count({ where: { copyrightStatus: "UNKNOWN" } }),
  ]);

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
            {songs.length} songs in the catalogue.
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
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Composer</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Mass parts</TableCell>
                <TableCell>Rights</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {songs.map((song) => {
                const parts = Array.isArray(song.massParts) ? (song.massParts as string[]) : [];
                return (
                  <TableRow key={song.slug} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{song.title}</TableCell>
                    <TableCell>{song.composer ?? "—"}</TableCell>
                    <TableCell>{massPartLabel(song.language)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                        {parts.slice(0, 3).map((p) => (
                          <Chip key={p} size="small" variant="outlined" label={massPartLabel(p)} />
                        ))}
                        {parts.length > 3 && (
                          <Chip size="small" variant="outlined" label={`+${parts.length - 3}`} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={massPartLabel(song.copyrightStatus)}
                        sx={{
                          fontWeight: 500,
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
      </Card>
    </Stack>
  );
}
