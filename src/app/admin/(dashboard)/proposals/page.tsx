import type { Metadata } from "next";
import Link from "next/link";
import type { MassPart, Prisma } from "@prisma/client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { CalendarPlus, Check, Inbox, X } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel, massPartOrder } from "@/lib/mass-parts";
import { formatDate } from "@/lib/utils";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { addAcceptedToPlan, reviewProposalItem } from "./actions";

export const metadata: Metadata = { title: "Song proposals" };
export const dynamic = "force-dynamic";

/** One card per Sunday, and a Sunday can carry a lot of songs. */
const PER_PAGE = 8;

const SCOPES = ["upcoming", "past", "all"] as const;
type Scope = (typeof SCOPES)[number];

const SCOPE_LABEL: Record<Scope, string> = {
  upcoming: "Upcoming",
  past: "Past",
  all: "All Sundays",
};

/** Parts where singing two different songs would be a mistake. */
const SINGLE_SONG_PARTS = new Set<MassPart>([
  "KYRIE",
  "GLORIA",
  "RESPONSORIAL_PSALM",
  "GOSPEL_ACCLAMATION",
  "CREED",
  "SANCTUS",
  "MYSTERY_OF_FAITH",
  "GREAT_AMEN",
  "OUR_FATHER",
  "AGNUS_DEI",
]);

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; page?: string }>;
}) {
  await requireSession("TECHNICAL");
  const sp = await searchParams;
  const scope: Scope = SCOPES.includes(sp.scope as Scope)
    ? (sp.scope as Scope)
    : "upcoming";

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  const where: Prisma.SongProposalWhereInput =
    scope === "upcoming"
      ? { sundayDate: { gte: today } }
      : scope === "past"
        ? { sundayDate: { lt: today } }
        : {};

  // Paginate by Sunday rather than by submission, so every proposal for a
  // given date stays on one page and can be compared.
  const [dates, scopeCounts] = await Promise.all([
    prisma.songProposal.groupBy({
      by: ["sundayDate"],
      where,
      orderBy: { sundayDate: scope === "past" ? "desc" : "asc" },
    }),
    Promise.all([
      prisma.songProposal.groupBy({
        by: ["sundayDate"],
        where: { sundayDate: { gte: today } },
      }),
      prisma.songProposal.groupBy({
        by: ["sundayDate"],
        where: { sundayDate: { lt: today } },
      }),
    ]),
  ]);

  const total = dates.length;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), pageCount);
  const pageDates = dates
    .slice((page - 1) * PER_PAGE, page * PER_PAGE)
    .map((d) => d.sundayDate);

  const proposals =
    pageDates.length === 0
      ? []
      : await prisma.songProposal.findMany({
          where: { sundayDate: { in: pageDates } },
          orderBy: { createdAt: "asc" },
          include: { items: true },
        });

  // Sunday → Mass part → every song proposed for it, whoever suggested it.
  const sundays = pageDates.map((date) => {
    const forDate = proposals.filter(
      (p) => p.sundayDate.getTime() === date.getTime(),
    );
    const rows = forDate.flatMap((p) =>
      p.items.map((item) => ({ item, proposer: p.proposerName })),
    );

    const byPart = new Map<MassPart, typeof rows>();
    for (const row of rows) {
      const list = byPart.get(row.item.part) ?? [];
      list.push(row);
      byPart.set(row.item.part, list);
    }

    return {
      date,
      name: forDate[0]?.sundayName ?? formatDate(date),
      year: forDate[0]?.lectionaryYear ?? null,
      proposers: new Set(forDate.map((p) => p.proposerName)).size,
      accepted: rows.filter((r) => r.item.status === "ACCEPTED").length,
      pending: rows.filter((r) => r.item.status === "PENDING").length,
      parts: [...byPart.entries()].sort(
        ([a], [b]) => massPartOrder(a) - massPartOrder(b),
      ),
    };
  });

  const counts = { upcoming: scopeCounts[0].length, past: scopeCounts[1].length };

  return (
    <Stack spacing={5}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", sm: "2.125rem" } }}>
          Song proposals
        </Typography>
        <Typography color="text.secondary">
          Grouped by Sunday, then by part of the Mass. Accept the songs the choir
          will sing, then send them to the plan.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        {SCOPES.map((s) => (
          <Chip
            key={s}
            label={
              s === "all"
                ? SCOPE_LABEL[s]
                : `${SCOPE_LABEL[s]} (${s === "upcoming" ? counts.upcoming : counts.past})`
            }
            component={Link}
            href={s === "upcoming" ? "/admin/proposals" : `/admin/proposals?scope=${s}`}
            clickable
            color={scope === s ? "primary" : "default"}
            variant={scope === s ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {sundays.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Inbox size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 1, fontWeight: 600 }}>
              {scope === "past" ? "No past proposals" : "Nothing proposed yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Members submit from the <Link href="/propose">Propose songs</Link> page.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={4}>
          {sundays.map((sunday) => (
            <Card key={sunday.date.toISOString()}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                >
                  <Box>
                    <Typography variant="h6">{sunday.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(sunday.date)}
                      {sunday.year ? ` · Year ${sunday.year}` : ""} ·{" "}
                      {sunday.proposers}{" "}
                      {sunday.proposers === 1 ? "proposer" : "proposers"}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      {sunday.accepted} accepted · {sunday.pending} to review
                    </Typography>
                    <form action={addAcceptedToPlan}>
                      <input
                        type="hidden"
                        name="date"
                        value={sunday.date.toISOString().slice(0, 10)}
                      />
                      <Button
                        type="submit"
                        size="small"
                        variant="contained"
                        startIcon={<CalendarPlus size={15} />}
                        disabled={sunday.accepted === 0}
                      >
                        Send to the plan
                      </Button>
                    </form>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Stack spacing={3}>
                  {sunday.parts.map(([part, rows]) => {
                    const acceptedHere = rows.filter(
                      (r) => r.item.status === "ACCEPTED",
                    ).length;
                    const clash =
                      acceptedHere > 1 && SINGLE_SONG_PARTS.has(part);

                    return (
                      <Box key={part}>
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ alignItems: "center", mb: 1 }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              color: "text.secondary",
                            }}
                          >
                            {massPartLabel(part)}
                          </Typography>
                          {rows.length > 1 && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`${rows.length} suggestions`}
                            />
                          )}
                        </Stack>

                        {clash && (
                          <Alert severity="warning" sx={{ mb: 1, py: 0 }}>
                            {acceptedHere} songs accepted for a part that is
                            normally sung once.
                          </Alert>
                        )}

                        <Stack spacing={0.5}>
                          {rows.map(({ item, proposer }) => (
                            <Stack
                              key={item.id}
                              direction="row"
                              spacing={2}
                              sx={{
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderBottom: "1px dashed rgba(40,33,30,0.12)",
                                py: 0.75,
                                pl: 2,
                              }}
                            >
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    textDecoration:
                                      item.status === "DECLINED"
                                        ? "line-through"
                                        : "none",
                                    color:
                                      item.status === "DECLINED"
                                        ? "text.disabled"
                                        : "text.primary",
                                  }}
                                >
                                  {item.song}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {proposer}
                                </Typography>
                              </Box>

                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ flexShrink: 0, alignItems: "center" }}
                              >
                                {item.status === "ACCEPTED" && (
                                  <Chip size="small" color="success" label="Singing" />
                                )}
                                {item.status === "DECLINED" && (
                                  <Chip size="small" variant="outlined" label="Not this time" />
                                )}
                                <form action={reviewProposalItem}>
                                  <input type="hidden" name="itemId" value={item.id} />
                                  <Tooltip title="Sing this one">
                                    {/* A disabled button fires no events, so the tooltip needs a wrapper. */}
                                    <span>
                                      <IconButton
                                        type="submit"
                                        name="status"
                                        value="ACCEPTED"
                                        size="small"
                                        color="success"
                                        disabled={item.status === "ACCEPTED"}
                                        aria-label={`Accept ${item.song}`}
                                      >
                                        <Check size={16} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </form>
                                <form action={reviewProposalItem}>
                                  <input type="hidden" name="itemId" value={item.id} />
                                  <Tooltip title="Not this time">
                                    <span>
                                      <IconButton
                                        type="submit"
                                        name="status"
                                        value="DECLINED"
                                        size="small"
                                        color="error"
                                        disabled={item.status === "DECLINED"}
                                        aria-label={`Decline ${item.song}`}
                                      >
                                        <X size={16} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </form>
                              </Stack>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {sundays.length > 0 && (
        <PaginationBar
          page={page}
          pageCount={pageCount}
          total={total}
          shown={sundays.length}
          basePath="/admin/proposals"
          params={{ scope: scope === "upcoming" ? undefined : scope }}
          label="Sundays"
        />
      )}
    </Stack>
  );
}
