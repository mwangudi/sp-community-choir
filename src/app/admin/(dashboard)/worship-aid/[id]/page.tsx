import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { MASS_PLAN_PART_ORDER } from "@/lib/mass-plans";
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

  return (
    <div className="aid-page">
      <div className="aid-toolbar no-print">
        <Link href={`/admin/mass-plans/${plan.id}`} className="aid-back">
          ← Back to the plan
        </Link>
        <PrintButton planId={plan.id} />
      </div>

      <article className="worship-aid">
        <header>
          <h1 className="aid-title">
            {plan.name.toUpperCase()} YEAR {plan.year} |{" "}
            {formatDate(plan.date).toUpperCase()}
            <span className="aid-parish">{choir.parish.toUpperCase()}</span>
          </h1>
        </header>

        {plan.items.map((item) => (
          <section key={item.id} className="aid-item">
            <h2 className="aid-part">
              <span className="aid-part-name">
                {massPartLabel(item.part).toUpperCase()}:
              </span>{" "}
              {item.song.toUpperCase()}
            </h2>
            {item.songRef?.lyrics && (
              <div
                className="aid-lyrics"
                dangerouslySetInnerHTML={{
                  __html: emphasise(lyricsForPart(item.songRef.lyrics, item.part)),
                }}
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
    </div>
  );
}
