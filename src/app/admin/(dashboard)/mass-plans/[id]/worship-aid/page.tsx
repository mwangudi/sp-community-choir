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
          include: { songRef: { select: { title: true, lyrics: true } } },
        },
      },
    }),
    getChoir(),
  ]);

  if (!plan) notFound();

  return (
    <div className="worship-aid">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/mass-plans/${plan.id}`}
          className="text-sm font-medium underline"
        >
          ← Back to the plan
        </Link>
        <PrintButton />
      </div>

      <header className="aid-header">
        <p className="aid-dedication">{plan.notes}</p>
        <h1 className="aid-title">
          {plan.name.toUpperCase()} YEAR {plan.year} | {formatDate(plan.date).toUpperCase()} |{" "}
          {choir.parish.toUpperCase()}
        </h1>
      </header>

      {plan.items.map((item) => {
        const lyrics = item.songRef?.lyrics;
        return (
          <section key={item.id} className="aid-item">
            <h2 className="aid-part">
              {massPartLabel(item.part).toUpperCase()}: {item.song.toUpperCase()}
            </h2>
            {lyrics ? (
              <div
                className="aid-lyrics"
                dangerouslySetInnerHTML={{ __html: lyrics }}
              />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
