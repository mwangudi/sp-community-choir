import type { Metadata } from "next";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MapPin, Pencil, Plus, Ticket } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { deleteConcert } from "./actions";

export const metadata: Metadata = { title: "Concerts" };
export const dynamic = "force-dynamic";

export default async function ConcertsPage() {
  await requireSession("TECHNICAL");
  const concerts = await prisma.concert.findMany({ orderBy: { startsAt: "desc" }, take: 100 });
  const now = new Date();

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Concerts</Typography>
          <Typography color="text.secondary">Upcoming and past events.</Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/concerts/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          New concert
        </Button>
      </Stack>

      {concerts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 12 }}>
            <Ticket size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 2 }}>No concerts yet</Typography>
            <Button
              component={Link}
              href="/admin/concerts/new"
              sx={{ mt: 3 }}
              variant="contained"
            >
              Add the first one
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 6,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" },
          }}
        >
          {concerts.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                  <Chip
                    size="small"
                    color={c.startsAt > now ? "success" : "default"}
                    label={c.startsAt > now ? "Upcoming" : "Past"}
                  />
                  {c.pinned && <Chip size="small" variant="outlined" label="Pinned" />}
                  {!c.isPublished && <Chip size="small" color="warning" label="Hidden" />}
                </Stack>
                <Typography variant="h6" sx={{ mt: 3 }}>
                  {c.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(c.startsAt)}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
                  <MapPin size={13} />
                  <Typography variant="caption" color="text.secondary">
                    {c.venue}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 3 }}>
                  {c.blurb}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 4, justifyContent: "flex-end" }}
                >
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      component={Link}
                      href={`/admin/concerts/${c.id}`}
                      aria-label={`Edit ${c.title}`}
                    >
                      <Pencil size={16} />
                    </IconButton>
                  </Tooltip>
                  <ConfirmDelete action={deleteConcert} id={c.id} name={c.title} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Stack>
  );
}
