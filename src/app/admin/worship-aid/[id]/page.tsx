import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { getChoir } from "@/lib/server/settings";
import { formatDate } from "@/lib/utils";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Worship aid" };
export const dynamic = "force-dynamic";

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
        <PrintButton />
      </div>

      <article className="worship-aid">
        <header>
          {plan.notes && <p className="aid-dedication">{plan.notes}</p>}
          <h1 className="aid-title">
            {plan.name.toUpperCase()} YEAR {plan.year} |{" "}
            {formatDate(plan.date).toUpperCase()} | {choir.parish.toUpperCase()}
          </h1>
        </header>

        {plan.items.map((item) => (
          <section key={item.id} className="aid-item">
            <h2 className="aid-part">
              {massPartLabel(item.part).toUpperCase()}: {item.song.toUpperCase()}
            </h2>
            {item.songRef?.lyrics && (
              <div
                className="aid-lyrics"
                dangerouslySetInnerHTML={{ __html: item.songRef.lyrics }}
              />
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
