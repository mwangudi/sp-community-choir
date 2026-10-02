import Link from "next/link";
import { BookOpen, ListMusic, Music4 } from "lucide-react";
import { prisma } from "@/lib/db";
import { dateKey, liturgicalContext, seasonLabel } from "@/lib/liturgical";
import { massPartLabel } from "@/lib/mass-parts";
import { CHOIR } from "@/lib/choir";

const LANGUAGE_LABEL: Record<string, string> = {
  ENGLISH: "English",
  SWAHILI: "Kiswahili",
  LATIN: "Latin",
  MALAGASY: "Malagasy",
  OTHER: "Other",
};

const PREVIEW_COUNT = 6;

/** This Sunday's order of service, from the published Mass plan. */
export async function MassOrderSection() {
  const ctx = liturgicalContext(new Date());

  const plan = await prisma.massPlan
    .findFirst({
      where: {
        date: new Date(`${dateKey(ctx.date)}T00:00:00.000Z`),
        status: "PUBLISHED",
      },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            songRef: {
              select: {
                slug: true,
                language: true,
                composer: true,
                arranger: true,
              },
            },
          },
        },
      },
    })
    .catch(() => null);

  if (!plan || plan.items.length === 0) return null;

  const shown = plan.items.slice(0, PREVIEW_COUNT);
  const remaining = plan.items.length - shown.length;

  return (
    <section id="mass-order" className="container scroll-mt-24 py-14 sm:py-16">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-subtle px-4 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">
            <BookOpen className="h-3.5 w-3.5" />
            Order of worship
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.2]">
            This Sunday&apos;s Mass Music
          </h2>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {plan.name}
            <span className="mx-1.5">•</span>
            {seasonLabel(ctx.season)} · Year {plan.year}
            <span className="mx-1.5">•</span>
            St. Paul&apos;s Chapel ({CHOIR.ministersAt.label})
          </p>
        </div>

        <Link
          href="/repertoire#this-sunday"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-gold-subtle md:self-auto"
        >
          <ListMusic className="h-[18px] w-[18px]" />
          See the full order
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item, i) => {
          const credit = [item.songRef?.composer, item.songRef?.arranger]
            .filter(Boolean)
            .join(" · ");
          const gold = i % 2 === 1;
          return (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-muted-strong">
                  <span
                    className={[
                      "text-[11px] font-bold uppercase tracking-[0.12em]",
                      gold ? "text-secondary" : "text-primary",
                    ].join(" ")}
                  >
                    {String(i + 1).padStart(2, "0")} •{" "}
                    {massPartLabel(item.part)}
                  </span>
                  <Music4 className="h-[18px] w-[18px] shrink-0" />
                </div>

                <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-foreground">
                  {item.songRef?.slug ? (
                    <Link
                      href={`/repertoire/${item.songRef.slug}`}
                      className="transition-colors hover:text-primary"
                    >
                      {item.song}
                    </Link>
                  ) : (
                    item.song
                  )}
                </h3>

                {credit && (
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {credit}
                  </p>
                )}
              </div>

              {item.songRef?.language && (
                <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-strong">
                  {LANGUAGE_LABEL[item.songRef.language] ??
                    item.songRef.language}
                  {plan.setting && plan.setting !== item.song
                    ? ` • ${plan.setting}`
                    : ""}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {remaining > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Plus {remaining} more {remaining === 1 ? "item" : "items"} in the order
          of service.{" "}
          <Link
            href="/repertoire#this-sunday"
            className="font-semibold text-primary hover:underline"
          >
            See them all
          </Link>
          .
        </p>
      )}
    </section>
  );
}
