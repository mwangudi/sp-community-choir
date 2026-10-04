import type { Metadata } from "next";
import Link from "next/link";
import type { Announcement } from "@prisma/client";
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
import { Link2, Megaphone, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { deleteAnnouncement, toggleAnnouncement } from "./actions";

export const metadata: Metadata = { title: "Announcements" };
export const dynamic = "force-dynamic";

/** Whether it is on the website right now, and why not if it isn't. */
function state(a: Announcement, now: Date) {
  if (!a.isActive) return { label: "Off", color: "default" as const };
  if (a.startsAt && a.startsAt > now) return { label: `From ${formatDate(a.startsAt)}`, color: "info" as const };
  if (a.endsAt && a.endsAt <= now) return { label: "Ended", color: "default" as const };
  return { label: "Showing", color: "success" as const };
}

export default async function AnnouncementsPage() {
  await requireSession("TECHNICAL");
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const now = new Date();

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Announcements</Typography>
          <Typography color="text.secondary">
            The news banner that scrolls under the website&apos;s main menu.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/announcements/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          New announcement
        </Button>
      </Stack>

      {announcements.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 12 }}>
            <Megaphone size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 2 }}>No announcements — the banner is hidden</Typography>
            <Button
              component={Link}
              href="/admin/announcements/new"
              sx={{ mt: 3 }}
              variant="contained"
            >
              Add the first one
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={4}>
          {announcements.map((a) => {
            const s = state(a, now);
            return (
              <Card key={a.id}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={4}
                    sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}
                      >
                        <Chip size="small" color={s.color} label={s.label} />
                        {a.endsAt && s.label === "Showing" && (
                          <Typography variant="caption" color="text.secondary">
                            until {formatDate(a.endsAt)}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Order {a.sortOrder}
                        </Typography>
                      </Stack>
                      <Typography>{a.message}</Typography>
                      {a.href && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
                          <Link2 size={13} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {a.linkLabel || "Details"} → {a.href}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
                      <form action={toggleAnnouncement}>
                        <input type="hidden" name="id" value={a.id} />
                        <Button type="submit" size="small" variant="outlined">
                          {a.isActive ? "Turn off" : "Turn on"}
                        </Button>
                      </form>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/admin/announcements/${a.id}`}
                          aria-label="Edit announcement"
                        >
                          <Pencil size={16} />
                        </IconButton>
                      </Tooltip>
                      <ConfirmDelete
                        action={deleteAnnouncement}
                        id={a.id}
                        name="this announcement"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
