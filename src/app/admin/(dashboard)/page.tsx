import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  CalendarDays,
  Camera,
  Inbox,
  Music2,
  NotebookPen,
  Sparkles,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  // MassPlan.date is a DATE column, so compare against UTC midnight.
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  const [
    pendingProposals,
    publishedPlans,
    songs,
    newApplications,
    posts,
    members,
    gallery,
    concerts,
    nextPlan,
    recent,
  ] = await Promise.all([
    prisma.songProposal.count({ where: { status: "PENDING" } }),
    prisma.massPlan.count({ where: { status: "PUBLISHED" } }),
    prisma.song.count({ where: { isActive: true } }),
    prisma.joinApplication.count({ where: { status: "NEW" } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.member.count({ where: { isActive: true } }),
    prisma.galleryItem.count({ where: { isPublished: true } }),
    prisma.concert.count({ where: { isPublished: true, startsAt: { gte: now } } }),
    prisma.massPlan.findFirst({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.songProposal.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, proposerName: true, sundayName: true, createdAt: true, status: true },
    }),
  ]);

  return {
    pendingProposals,
    publishedPlans,
    songs,
    newApplications,
    posts,
    members,
    gallery,
    concerts,
    nextPlan,
    recent,
  };
}

/** Soft tint + solid icon, the way Materio treats its stat icons. */
const TONE = {
  red: { fg: "#BC0424", bg: "rgba(188,4,36,0.12)" },
  gold: { fg: "#B87809", bg: "rgba(253,179,33,0.18)" },
  teal: { fg: "#0F766E", bg: "rgba(15,118,110,0.12)" },
  indigo: { fg: "#4338CA", bg: "rgba(67,56,202,0.12)" },
  grey: { fg: "#6E6B7B", bg: "rgba(110,107,123,0.12)" },
} as const;

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const s = await getStats();

  const stats = [
    { label: "Proposals", value: s.pendingProposals, icon: Inbox, tone: TONE.red, href: "/admin/proposals" },
    { label: "Plans", value: s.publishedPlans, icon: CalendarDays, tone: TONE.gold, href: "/admin/mass-plans" },
    { label: "Songs", value: s.songs, icon: Music2, tone: TONE.teal, href: "/admin/songs" },
    { label: "Posts", value: s.posts, icon: NotebookPen, tone: TONE.indigo, href: "/admin/blog" },
    { label: "Concerts", value: s.concerts, icon: Ticket, tone: TONE.gold, href: "/admin/concerts" },
    { label: "Gallery", value: s.gallery, icon: Camera, tone: TONE.teal, href: "/admin/gallery" },
    { label: "Members", value: s.members, icon: Users, tone: TONE.indigo, href: "/admin/members" },
    { label: "Applicants", value: s.newApplications, icon: UserPlus, tone: TONE.grey, href: "/admin/applications" },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gap: 6,
        gridTemplateColumns: { xs: "1fr", lg: "repeat(12, 1fr)" },
        alignItems: "stretch",
      }}
    >
      {/* Welcome */}
      <Card sx={{ gridColumn: { lg: "span 4" }, position: "relative", overflow: "hidden" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "primary.main" }}>
            Karibu, {session.name.split(" ")[0]}! 🎵
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {s.pendingProposals > 0
              ? "Proposals are waiting for review"
              : "Nothing is waiting for review"}
          </Typography>
          <Typography variant="h4" sx={{ mt: 4, fontWeight: 500, color: "primary.main", lineHeight: 1 }}>
            {s.pendingProposals}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            pending song proposals
          </Typography>
          <Box sx={{ mt: 5 }}>
            <Button component={Link} href="/admin/proposals" variant="contained" size="small">
              Review now
            </Button>
          </Box>
          <Sparkles
            size={92}
            style={{
              position: "absolute",
              right: -12,
              bottom: -12,
              opacity: 0.07,
              color: "#BC0424",
            }}
          />
        </CardContent>
      </Card>

      {/* At a glance */}
      <Card sx={{ gridColumn: { lg: "span 8" } }}>
        <CardContent>
          <Typography variant="h6">At a glance</Typography>
          <Typography variant="body2" color="text.secondary">
            The choir&apos;s music and people, in numbers
          </Typography>

          <Box
            sx={{
              mt: 6,
              display: "grid",
              gap: 5,
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
            }}
          >
            {stats.map(({ label, value, icon: Icon, tone, href }) => (
              <Stack
                key={label}
                component={Link}
                href={href}
                direction="row"
                spacing={3}
                sx={{ alignItems: "center", textDecoration: "none", color: "inherit" }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: tone.bg,
                    color: tone.fg,
                  }}
                >
                  <Icon size={19} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {label}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, lineHeight: 1.2 }}>{value}</Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Next Sunday */}
      <Card sx={{ gridColumn: { lg: "span 8" } }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Box>
              <Typography variant="h6">Next Sunday</Typography>
              <Typography variant="body2" color="text.secondary">
                {s.nextPlan
                  ? `${s.nextPlan.name} · ${formatDate(s.nextPlan.date)}`
                  : "No upcoming plan has been created yet."}
              </Typography>
            </Box>
            <Button
              component={Link}
              href={
                s.nextPlan
                  ? `/admin/mass-plans/${s.nextPlan.id}`
                  : "/admin/mass-plans/new"
              }
              variant="contained"
              size="small"
            >
              {s.nextPlan ? "Open plan" : "Create a plan"}
            </Button>
          </Stack>

          {s.nextPlan && (
            <>
              <Stack direction="row" spacing={2} sx={{ mt: 4, flexWrap: "wrap", gap: 2 }}>
                <Chip
                  size="small"
                  label={s.nextPlan.status}
                  color={s.nextPlan.status === "PUBLISHED" ? "success" : "default"}
                />
                {s.nextPlan.setting && (
                  <Chip size="small" label={s.nextPlan.setting} variant="outlined" />
                )}
                {s.nextPlan.leader && (
                  <Chip size="small" label={s.nextPlan.leader} variant="outlined" />
                )}
              </Stack>
              <Divider sx={{ my: 4 }} />
              <Box
                sx={{
                  display: "grid",
                  columnGap: 10,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                }}
              >
                {s.nextPlan.items.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={3}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      py: 1,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        flexShrink: 0,
                      }}
                    >
                      {massPartLabel(item.part)}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right" }}>
                      {item.song}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent proposals */}
      <Card sx={{ gridColumn: { lg: "span 4" } }}>
        <CardContent>
          <Typography variant="h6">Latest proposals</Typography>
          <Typography variant="body2" color="text.secondary">
            Most recent submissions
          </Typography>

          <Stack spacing={5} sx={{ mt: 6 }}>
            {s.recent.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Nothing submitted yet.
              </Typography>
            )}
            {s.recent.map((p) => (
              <Stack
                key={p.id}
                component={Link}
                href="/admin/proposals"
                direction="row"
                spacing={3}
                sx={{
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: TONE.red.bg,
                    color: TONE.red.fg,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  {p.proposerName.slice(0, 1).toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {p.proposerName}
                  </Typography>
                  <Typography variant="caption" component="div" color="text.secondary" noWrap>
                    {p.sundayName}
                  </Typography>
                </Box>
                <Stack spacing={1} sx={{ flexShrink: 0, alignItems: "flex-end" }}>
                  <Chip
                    size="small"
                    label={massPartLabel(p.status)}
                    color={p.status === "PENDING" ? "warning" : "default"}
                    variant={p.status === "PENDING" ? "filled" : "outlined"}
                  />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {formatDate(p.createdAt)}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
