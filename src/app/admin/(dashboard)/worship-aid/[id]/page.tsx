import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { ArrowLeft, CircleCheck, Pencil, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { MASS_PLAN_PART_ORDER } from "@/lib/mass-plans";
import { massKindLabel, plansHref } from "@/lib/mass-occasions";
import { getChoir } from "@/lib/server/settings";
import { formatDate } from "@/lib/utils";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Worship aid" };
export const dynamic = "force-dynamic";

/**
 * A Mass setting is one record holding every movement, each under its own
 * heading. Printing all of them under Kyrie, then again under Gloria, buries
 * the congregation, so show only the movement being sung.
 */
const ORDINARY = new Set([
  "kyrie",
  "gloria",
  "sanctus",
  "mystery of faith",
  "great amen",
  "agnus dei",
]);

/**
 * Only a movement name marks a new section. Editors also bold a whole
 * paragraph for emphasis — a refrain, most often — and treating that as a
 * heading used to drop every verse above it from the printed aid.
 */
const MOVEMENTS = new Set(MASS_PLAN_PART_ORDER.map((p) => p.toLowerCase()));

function lyricsForPart(lyrics: string, part: string) {
  const heading = /<p><strong>([^<]+)<\/strong><\/p>/g;
  const sections: { label: string; start: number; end: number }[] = [];

  for (let m = heading.exec(lyrics); m; m = heading.exec(lyrics)) {
    const label = m[1].trim().toLowerCase();
    if (!MOVEMENTS.has(label)) continue;
    if (sections.length > 0) sections[sections.length - 1].end = m.index;
    sections.push({
      label,
      start: m.index + m[0].length,
      end: lyrics.length,
    });
  }
  if (sections.length === 0) return lyrics;

  const wanted = massPartLabel(part).toLowerCase();
  const match = sections.find((s) => s.label === wanted);
  if (match) return lyrics.slice(match.start, match.end);

  // We simply do not hold this movement; printing another one would mislead.
  if (ORDINARY.has(wanted) && sections.some((s) => ORDINARY.has(s.label))) {
    return "";
  }
  // Anything above the first movement heading belongs to that movement, so
  // start from the top rather than discarding it.
  return lyrics.slice(0, sections[0].end);
}

/**
 * The printed aid sets a verse number in bold and a braced refrain bold
 * throughout. Lyrics are stored as escaped text, so only line starts match.
 */
function emphasise(html: string) {
  return html
    .split(/(<br \/>|<\/p><p>|<p>|<\/p>)/)
    .map((part) => {
      if (part.startsWith("<")) return part;
      if (/[{}]/.test(part)) return `<strong>${part}</strong>`;
      return part.replace(/^(\s*\d+\.)/, "<strong>$1</strong>");
    })
    .join("");
}

export default async function WorshipAidPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession("TECHNICAL");

  const { id } = await params;
  const [plan, choir] = await Promise.all([
    prisma.massPlan.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: { songRef: { select: { lyrics: true } } },
        },
      },
    }),
    getChoir(),
  ]);

  if (!plan) notFound();
  const sunday = plan.kind === "SUNDAY";
  const editHref = `${plansHref(plan.kind)}/${plan.id}`;
  const place = plan.venue ?? choir.parish;

  const items = plan.items.map((item) => ({
    ...item,
    lyrics: item.songRef?.lyrics ? lyricsForPart(item.songRef.lyrics, item.part) : "",
  }));
  // A recited part has nothing to print by design; anything else prints a bare heading.
  const bare = items.filter(
    (i) => !i.lyrics.trim() && !/^recited?$/i.test(i.song.trim()),
  );

  const details: [string, string | null][] = [
    ["Occasion", massKindLabel(plan.kind)],
    ["Date", formatDate(plan.date)],
    ["Lectionary year", sunday ? (plan.year ? `Year ${plan.year}` : "Not set") : null],
    ["Venue", place],
    ["Mass setting", plan.setting],
    ["Leader", plan.leader],
    ["Songs", String(plan.items.length)],
  ];

  return (
    <Stack spacing={6} className="aid-screen">
      <Stack
        className="no-print"
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Button
            component={Link}
            href={editHref}
            size="small"
            color="inherit"
            startIcon={<ArrowLeft size={15} />}
            sx={{ mb: 1, ml: -1, color: "text.secondary" }}
          >
            Back to the plan
          </Button>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h4">Worship aid</Typography>
            <Chip size="small" variant="outlined" label={massKindLabel(plan.kind)} />
            {sunday && (
              <Chip
                size="small"
                label={plan.status}
                color={plan.status === "PUBLISHED" ? "success" : "default"}
              />
            )}
          </Stack>
          <Typography color="text.secondary">
            {plan.name} · {formatDate(plan.date)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <PrintButton planId={plan.id} />
          <Tooltip title="Edit the plan">
            <IconButton component={Link} href={editHref} aria-label="Edit the plan">
              <Pencil size={17} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Box className="aid-layout">
        <Card className="aid-sheet-card">
          <Box className="aid-sheet-well" sx={{ bgcolor: "action.hover" }}>
            <article className="worship-aid">
              <header>
                <h1 className="aid-title">
                  {plan.name.toUpperCase()}
                  {/* Optional, and only meaningful on a Sunday. */}
                  {sunday && plan.year ? ` YEAR ${plan.year}` : ""} |{" "}
                  {formatDate(plan.date).toUpperCase()}
                  <span className="aid-parish">{place.toUpperCase()}</span>
                </h1>
              </header>

              {items.map((item) => (
                <section key={item.id} className="aid-item">
                  <h2 className="aid-part">
                    <span className="aid-part-name">
                      {massPartLabel(item.part).toUpperCase()}:
                    </span>{" "}
                    {item.song.toUpperCase()}
                  </h2>
                  {item.lyrics && (
                    <div
                      className="aid-lyrics"
                      dangerouslySetInnerHTML={{ __html: emphasise(item.lyrics) }}
                    />
                  )}
                </section>
              ))}

              {plan.notes && (
                <footer className="aid-dedication">
                  <p>{plan.notes}</p>
                </footer>
              )}
            </article>
          </Box>
        </Card>

        <Stack spacing={6} className="no-print">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Details
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={2}>
                {details
                  .filter((d): d is [string, string] => Boolean(d[1]))
                  .map(([label, value]) => (
                    <Stack
                      key={label}
                      direction="row"
                      spacing={3}
                      sx={{ justifyContent: "space-between", alignItems: "baseline" }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
                        {value}
                      </Typography>
                    </Stack>
                  ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    color: bare.length === 0 ? "success.main" : "warning.main",
                  }}
                >
                  {bare.length === 0 ? <CircleCheck size={18} /> : <TriangleAlert size={18} />}
                </Box>
                <Typography variant="h6">Lyrics check</Typography>
              </Stack>
              {bare.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Every song prints with its words.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {bare.length === 1 ? "This prints" : "These print"} as a heading only — add the
                    lyrics, or the movement to the setting, before printing.
                  </Typography>
                  <Stack spacing={1}>
                    {bare.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        spacing={2}
                        sx={{ justifyContent: "space-between", alignItems: "baseline" }}
                      >
                        <Typography variant="body2" sx={{ minWidth: 0 }}>
                          <Box component="span" sx={{ color: "text.secondary" }}>
                            {massPartLabel(item.part)}:
                          </Box>{" "}
                          {item.song}
                        </Typography>
                        {item.songSlug ? (
                          <Button
                            component={Link}
                            href={`/admin/songs/${item.songSlug}`}
                            size="small"
                            sx={{ flexShrink: 0 }}
                          >
                            Edit song
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                            not linked
                          </Typography>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
