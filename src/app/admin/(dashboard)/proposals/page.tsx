import type { Metadata } from "next";
import Link from "next/link";
import type { ProposalStatus } from "@prisma/client";
import {
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

// Each card lists a full set of proposed songs, so keep the page short.
const PER_PAGE = 15;

const STATUSES: ProposalStatus[] = ["PENDING", "REVIEWED", "ACCEPTED", "DECLINED"];

const STATUS_COLOR: Record<
  ProposalStatus,
  "default" | "warning" | "info" | "success" | "error"
> = {
  PENDING: "warning",
  REVIEWED: "info",
  ACCEPTED: "success",
  DECLINED: "error",
};

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireSession("TECHNICAL");
  const { status, page: rawPage } = await searchParams;
  const active = STATUSES.includes(status as ProposalStatus)
    ? (status as ProposalStatus)
    : undefined;

  const where = active ? { status: active } : undefined;
  const total = await prisma.songProposal.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(Number(rawPage) || 1, 1), pageCount);

  const [proposals, counts] = await Promise.all([
    prisma.songProposal.findMany({
      where,
      orderBy: [{ sundayDate: "asc" }, { createdAt: "desc" }],
      include: { items: true },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.songProposal.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (s: ProposalStatus) =>
    counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", sm: "2.125rem" } }}>
          Song proposals
        </Typography>
        <Typography color="text.secondary">
          Submissions from members for upcoming Sundays.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        <Chip
          label={`All (${counts.reduce((n, c) => n + c._count, 0)})`}
          component={Link}
          href="/admin/proposals"
          clickable
          color={active ? "default" : "primary"}
          variant={active ? "outlined" : "filled"}
        />
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={`${massPartLabel(s)} (${countFor(s)})`}
            component={Link}
            href={`/admin/proposals?status=${s}`}
            clickable
            color={active === s ? STATUS_COLOR[s] : "default"}
            variant={active === s ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {proposals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Inbox size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 1, fontWeight: 600 }}>
              No proposals here yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Members can submit from the{" "}
              <Link href="/propose">Propose songs</Link> page.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {proposals.map((p) => (
            <Card key={p.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  sx={{ justifyContent: "space-between", alignItems: { md: "flex-start" } }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography variant="h6">{p.sundayName}</Typography>
                      <Chip size="small" label={p.status} color={STATUS_COLOR[p.status]} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(p.sundayDate)}
                      {p.lectionaryYear ? ` · Year ${p.lectionaryYear}` : ""} ·
                      proposed by {p.proposerName}
                      {p.voice ? ` (${massPartLabel(p.voice)})` : ""}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Received {formatDate(p.createdAt)}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "grid",
                    gap: 0.5,
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                  }}
                >
                  {[...p.items]
                    .sort((a, b) => massPartOrder(a.part) - massPartOrder(b.part))
                    .map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        spacing={2}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: "1px dashed rgba(40,33,30,0.12)",
                          py: 0.75,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 700, textTransform: "uppercase", flexShrink: 0 }}
                        >
                          {massPartLabel(item.part)}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1,
                            textAlign: "right",
                            textDecoration:
                              item.status === "DECLINED" ? "line-through" : "none",
                            color:
                              item.status === "DECLINED" ? "text.disabled" : "text.primary",
                          }}
                        >
                          {item.song}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{ flexShrink: 0, alignItems: "center" }}
                        >
                          {item.status === "ACCEPTED" && (
                            <Chip size="small" color="success" label="In" />
                          )}
                          {item.status === "DECLINED" && (
                            <Chip size="small" variant="outlined" label="Out" />
                          )}
                          <form action={reviewProposalItem}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <Tooltip title="Accept this song">
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
                            </Tooltip>
                          </form>
                          <form action={reviewProposalItem}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <Tooltip title="Decline this song">
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
                            </Tooltip>
                          </form>
                        </Stack>
                      </Stack>
                    ))}
                </Box>

                {p.note && (
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
                    “{p.note}”
                  </Typography>
                )}

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 3, flexWrap: "wrap", gap: 2, alignItems: "center" }}
                >
                  <form action={addAcceptedToPlan}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button
                      type="submit"
                      size="small"
                      variant="contained"
                      startIcon={<CalendarPlus size={15} />}
                      disabled={p.items.every((i) => i.status !== "ACCEPTED")}
                    >
                      Add accepted to the plan
                    </Button>
                  </form>
                  <Typography variant="caption" color="text.secondary">
                    {p.items.filter((i) => i.status === "ACCEPTED").length} accepted ·{" "}
                    {p.items.filter((i) => i.status === "PENDING").length} still to review
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {proposals.length > 0 && (
        <PaginationBar
          page={page}
          pageCount={pageCount}
          total={total}
          shown={proposals.length}
          basePath="/admin/proposals"
          params={{ status: active }}
          label="proposals"
        />
      )}
    </Stack>
  );
}
