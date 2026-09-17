import Link from "next/link";
import type { ReactNode } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  Camera,
  Clock,
  Inbox,
  Music2,
  NotebookPen,
  ShieldCheck,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { getChoir } from "@/lib/server/settings";
import { ADMIN_SURFACE } from "@/components/admin/surface";
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
    totalPlans,
    songs,
    rightsConfirmed,
    newApplications,
    posts,
    members,
    membersConsented,
    galleryPublished,
    galleryTotal,
    concerts,
    nextPlan,
    recentProposals,
    recentApplications,
  ] = await Promise.all([
    prisma.songProposal.count({ where: { status: "PENDING" } }),
    prisma.massPlan.count({ where: { status: "PUBLISHED" } }),
    prisma.massPlan.count(),
    prisma.song.count({ where: { isActive: true } }),
    prisma.song.count({
      where: { isActive: true, NOT: { copyrightStatus: "UNKNOWN" } },
    }),
    prisma.joinApplication.count({ where: { status: "NEW" } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.member.count({ where: { isActive: true } }),
    prisma.member.count({ where: { isActive: true, mediaConsent: true } }),
    prisma.galleryItem.count({ where: { isPublished: true } }),
    prisma.galleryItem.count(),
    prisma.concert.count({ where: { isPublished: true, startsAt: { gte: now } } }),
    prisma.massPlan.findFirst({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.songProposal.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        proposerName: true,
        sundayName: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.joinApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        voice: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    pendingProposals,
    publishedPlans,
    totalPlans,
    songs,
    rightsConfirmed,
    newApplications,
    posts,
    members,
    membersConsented,
    galleryPublished,
    galleryTotal,
    concerts,
    nextPlan,
    recentProposals,
    recentApplications,
  };
}

/** The choir's cardinal and gold, deep enough to carry white text. */
const TILE = {
  cardinalDeep: ADMIN_SURFACE.bg,
  cardinal: "#BC0424",
  gold: "#B87809",
  bronze: "#7C4A0B",
} as const;

/**
 * KPI tile. One tile is filled to carry the call to action; the rest stay
 * white so four brand colours don't fight each other.
 */
function Tile({
  label,
  value,
  caption,
  icon,
  accent,
  href,
  solid = false,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: ReactNode;
  accent: string;
  href: string;
  solid?: boolean;
}) {
  const big = String(value).length > 12 ? 20 : 30;

  return (
    <Card
      component={Link}
      href={href}
      sx={{
        gridColumn: { lg: "span 3" },
        textDecoration: "none",
        display: "block",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
        ...(solid
          ? {
              bgcolor: accent,
              // The admin theme colours Typography explicitly, so force it back.
              "& .MuiTypography-root": { color: "#fff" },
            }
          : { bgcolor: "background.paper", border: 1, borderColor: "divider" }),
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: solid ? "rgba(255,255,255,0.18)" : `${accent}1F`,
              color: solid ? "#fff" : accent,
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: solid ? "inherit" : "text.secondary",
            }}
          >
            {label}
          </Typography>
        </Stack>
        <Typography
          sx={{
            fontSize: big,
            fontWeight: 600,
            lineHeight: 1.15,
            color: solid ? "inherit" : "text.primary",
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: 13,
            color: solid ? "inherit" : "text.secondary",
            opacity: solid ? 0.85 : 1,
          }}
        >
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
        <Box sx={{ color: "text.secondary", mt: 0.25 }}>{icon}</Box>
        <Box>
          <Typography
            className="admin-display"
            sx={{ fontWeight: 600, lineHeight: 1.3, fontSize: "1.0625rem" }}
          >
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}

function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", py: 7 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "action.hover",
          color: "text.disabled",
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 260 }}>
        {body}
      </Typography>
    </Stack>
  );
}

/** Quota-style row: label, "n of m", and a thin bar. */
function MeterRow({
  label,
  done,
  total,
  unit,
}: {
  label: string;
  done: number;
  total: number;
  unit: string;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <Box>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1 }}
      >
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {done} of {total} {unit}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 6, borderRadius: 3 }}
        color={pct === 100 ? "success" : pct >= 50 ? "primary" : "warning"}
      />
    </Box>
  );
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "text.secondary" }}>
        {icon}
        <Typography
          sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>
        {value}
      </Typography>
    </Box>
  );
}

function Avatar({ initial }: { initial: string }) {
  return (
    <Box
      sx={{
        width: 38,
        height: 38,
        flexShrink: 0,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(188,4,36,0.12)",
        color: TILE.cardinal,
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      {initial}
    </Box>
  );
}

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const [s, choir, me] = await Promise.all([
    getStats(),
    getChoir(),
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { voice: true, lastLoginAt: true, createdAt: true },
    }),
  ]);

  const rightsBacklog = s.songs - s.rightsConfirmed;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 6,
        gridTemplateColumns: { xs: "1fr", lg: "repeat(12, 1fr)" },
        alignItems: "start",
      }}
    >
      {/* Identity strip */}
      <Card sx={{ gridColumn: { lg: "span 12" } }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
          >
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                {session.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {massPartLabel(session.role)}
                {me?.voice ? ` · ${massPartLabel(me.voice)}` : ""} ·{" "}
                {choir.shortName}
              </Typography>
            </Box>
            <Chip
              size="small"
              icon={<BadgeCheck size={14} />}
              label="Signed in"
              color="success"
              variant="outlined"
            />
          </Stack>

          <Box
            sx={{
              mt: 5,
              display: "grid",
              gap: 5,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                lg: "repeat(5, 1fr)",
              },
            }}
          >
            <Meta icon={<AtSign size={13} />} label="Email" value={session.email} />
            <Meta
              icon={<Clock size={13} />}
              label="Last sign-in"
              value={me?.lastLoginAt ? formatDate(me.lastLoginAt) : "First visit"}
            />
            <Meta
              icon={<CalendarDays size={13} />}
              label="Rehearsals"
              value={`${choir.rehearsals.day} · ${choir.rehearsals.time}`}
            />
            <Meta
              icon={<Music2 size={13} />}
              label="Sunday Mass"
              value={choir.ministersAt.label}
            />
            <Meta
              icon={<NotebookPen size={13} />}
              label="Published posts"
              value={String(s.posts)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* KPI tiles */}
      <Tile
        label="Proposals"
        value={s.pendingProposals}
        caption="awaiting review"
        icon={<Inbox size={16} />}
        accent={TILE.cardinalDeep}
        href="/admin/proposals"
        solid
      />
      <Tile
        label="Next Sunday"
        value={s.nextPlan ? s.nextPlan.name : "Not planned"}
        caption={s.nextPlan ? formatDate(s.nextPlan.date) : "no upcoming plan"}
        icon={<CalendarDays size={16} />}
        accent={TILE.gold}
        href={s.nextPlan ? `/admin/mass-plans/${s.nextPlan.id}` : "/admin/mass-plans/new"}
      />
      <Tile
        label="Repertoire"
        value={s.songs}
        caption="songs in the catalogue"
        icon={<Music2 size={16} />}
        accent={TILE.cardinal}
        href="/admin/songs"
      />
      <Tile
        label="Applicants"
        value={s.newApplications}
        caption="waiting for a reply"
        icon={<UserPlus size={16} />}
        accent={TILE.bronze}
        href="/admin/applications"
      />

      {/* Next Sunday */}
      <Card sx={{ gridColumn: { lg: "span 8" } }}>
        <CardContent>
          <SectionHeader
            icon={<CalendarDays size={18} />}
            title="Next Sunday"
            subtitle={
              s.nextPlan
                ? `${s.nextPlan.name} · ${formatDate(s.nextPlan.date)}`
                : "The order of service for the coming Sunday"
            }
            action={
              <Button
                component={Link}
                href={
                  s.nextPlan ? `/admin/mass-plans/${s.nextPlan.id}` : "/admin/mass-plans/new"
                }
                variant="contained"
                size="small"
              >
                {s.nextPlan ? "Open plan" : "Create a plan"}
              </Button>
            }
          />

          {!s.nextPlan ? (
            <EmptyState
              icon={<CalendarDays size={20} />}
              title="No upcoming plan"
              body="Once a Sunday is planned, its full order of service appears here."
            />
          ) : (
            <>
              <Stack direction="row" spacing={2} sx={{ mt: 4, flexWrap: "wrap", gap: 2 }}>
                <Chip
                  size="small"
                  label={massPartLabel(s.nextPlan.status)}
                  color={s.nextPlan.status === "PUBLISHED" ? "success" : "default"}
                />
                <Chip size="small" variant="outlined" label={`Year ${s.nextPlan.year}`} />
                {s.nextPlan.setting && (
                  <Chip size="small" variant="outlined" label={s.nextPlan.setting} />
                )}
                {s.nextPlan.leader && (
                  <Chip size="small" variant="outlined" label={s.nextPlan.leader} />
                )}
              </Stack>
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "action.hover",
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
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      {massPartLabel(item.part)}
                    </Typography>
                    <Typography
                      className="admin-song"
                      sx={{ textAlign: "right", fontWeight: 500 }}
                    >
                      {item.song}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Where things stand */}
      <Card sx={{ gridColumn: { lg: "span 4" } }}>
        <CardContent>
          <SectionHeader
            icon={<ShieldCheck size={18} />}
            title="Where things stand"
            subtitle="What still needs attention"
          />
          <Stack spacing={4} sx={{ mt: 5 }}>
            <MeterRow
              label="Song rights confirmed"
              done={s.rightsConfirmed}
              total={s.songs}
              unit="songs"
            />
            <MeterRow
              label="Media consent recorded"
              done={s.membersConsented}
              total={s.members}
              unit="members"
            />
            <MeterRow
              label="Gallery published"
              done={s.galleryPublished}
              total={s.galleryTotal}
              unit="photos"
            />
            <MeterRow
              label="Mass plans published"
              done={s.publishedPlans}
              total={s.totalPlans}
              unit="plans"
            />
          </Stack>

          {rightsBacklog > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: "block" }}>
              {rightsBacklog} song{rightsBacklog === 1 ? "" : "s"} still need a copyright
              check — their scores stay members-only until then.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Latest proposals */}
      <Card sx={{ gridColumn: { lg: "span 6" } }}>
        <CardContent>
          <SectionHeader
            icon={<Inbox size={18} />}
            title="Latest proposals"
            subtitle="Songs members have suggested"
            action={
              <Button component={Link} href="/admin/proposals" size="small">
                View all
              </Button>
            }
          />
          {s.recentProposals.length === 0 ? (
            <EmptyState
              icon={<Inbox size={20} />}
              title="Nothing submitted yet"
              body="Proposals from the website appear here as members send them in."
            />
          ) : (
            <Stack spacing={4} sx={{ mt: 5 }}>
              {s.recentProposals.map((p) => (
                <Stack
                  key={p.id}
                  component={Link}
                  href="/admin/proposals"
                  direction="row"
                  spacing={3}
                  sx={{ alignItems: "center", textDecoration: "none", color: "inherit" }}
                >
                  <Avatar initial={p.proposerName.slice(0, 1).toUpperCase()} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
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
          )}
        </CardContent>
      </Card>

      {/* Latest applications */}
      <Card sx={{ gridColumn: { lg: "span 6" } }}>
        <CardContent>
          <SectionHeader
            icon={<UserPlus size={18} />}
            title="Who wants to join"
            subtitle="Applications from the website"
            action={
              <Button component={Link} href="/admin/applications" size="small">
                View all
              </Button>
            }
          />
          {s.recentApplications.length === 0 ? (
            <EmptyState
              icon={<Users size={20} />}
              title="No applications yet"
              body="When someone applies through the join form, they land here."
            />
          ) : (
            <Stack spacing={4} sx={{ mt: 5 }}>
              {s.recentApplications.map((a) => (
                <Stack
                  key={a.id}
                  component={Link}
                  href="/admin/applications"
                  direction="row"
                  spacing={3}
                  sx={{ alignItems: "center", textDecoration: "none", color: "inherit" }}
                >
                  <Avatar initial={a.firstName.slice(0, 1).toUpperCase()} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {a.firstName} {a.lastName}
                    </Typography>
                    <Typography variant="caption" component="div" color="text.secondary" noWrap>
                      {a.voice ? massPartLabel(a.voice) : "Voice not stated"}
                    </Typography>
                  </Box>
                  <Stack spacing={1} sx={{ flexShrink: 0, alignItems: "flex-end" }}>
                    <Chip
                      size="small"
                      label={massPartLabel(a.status)}
                      color={a.status === "NEW" ? "warning" : "default"}
                      variant={a.status === "NEW" ? "filled" : "outlined"}
                    />
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {formatDate(a.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <Card sx={{ gridColumn: { lg: "span 12" } }}>
        <CardContent>
          <SectionHeader
            icon={<Ticket size={18} />}
            title="Jump to"
            subtitle="The rest of the choir's content"
          />
          <Stack direction="row" spacing={3} sx={{ mt: 4, flexWrap: "wrap", gap: 3 }}>
            {[
              { href: "/admin/concerts", label: `Concerts (${s.concerts} upcoming)`, icon: <Ticket size={15} /> },
              { href: "/admin/gallery", label: `Gallery (${s.galleryPublished} live)`, icon: <Camera size={15} /> },
              { href: "/admin/members", label: `Members (${s.members})`, icon: <Users size={15} /> },
              { href: "/admin/blog", label: `Blog (${s.posts} published)`, icon: <NotebookPen size={15} /> },
              { href: "/admin/settings", label: "Site settings", icon: <ShieldCheck size={15} /> },
            ].map((l) => (
              <Button
                key={l.href}
                component={Link}
                href={l.href}
                variant="outlined"
                size="small"
                startIcon={l.icon}
                color="inherit"
              >
                {l.label}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
