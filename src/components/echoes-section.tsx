import Link from "next/link";
import { ArrowUpRight, PlayCircle, Youtube } from "lucide-react";
import { prisma } from "@/lib/db";
import { massPartLabel } from "@/lib/mass-parts";
import { CHOIR } from "@/lib/choir";
import { formatDate } from "@/lib/utils";

const YOUTUBE_HREF =
  CHOIR.socials.find((s) => s.icon === "youtube")?.href ?? "/masses";

const STRANDS = [
  {
    title: "Authentic African choral heritage",
    blurb:
      "Swahili, Dholuo, Gikuyu and Lingala settings arranged for four-part harmony, sung the way our jumuiyas sing them.",
  },
  {
    title: "Western polyphony & Gregorian chant",
    blurb:
      "Latin motets, Mass ordinaries and the timeless hymns of the Church, prepared with the care the liturgy deserves.",
  },
];

/** Latest Sunday Mass recording, with that day's order beside it. */
export async function EchoesSection() {
  const plan = await prisma.massPlan
    .findFirst({
      where: { status: "PUBLISHED", youtubeId: { not: null } },
      orderBy: { date: "desc" },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    })
    .catch(() => null);

  return (
    <section id="repertoire" className="w-full bg-ink py-14 text-background sm:py-16">
      <div className="container grid items-center gap-12 lg:grid-cols-12">
        <div className="min-w-0 rounded-2xl bg-white/[0.06] p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:col-span-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-pulse rounded-full bg-primary-bright" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold">
                Choir recording archive
              </span>
            </span>
            {plan && (
              <span className="text-[13px] text-background/70">
                {formatDate(plan.date)}
                {plan.setting && ` • ${plan.setting}`}
              </span>
            )}
          </div>

          {plan ? (
            <>
              <div className="flex items-center gap-5 pb-6">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-foreground shadow-lg">
                  <PlayCircle className="h-8 w-8" />
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gold">
                    Latest recording
                  </span>
                  <h3 className="mt-0.5 truncate font-serif text-2xl font-medium">
                    {plan.name}
                  </h3>
                  <p className="text-[13px] text-background/80">
                    Live from St. Paul&apos;s Chapel, University of Nairobi
                  </p>
                </div>
              </div>

              <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${plan.youtubeId}`}
                  title={`${plan.name} — Sunday Mass`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>

              {plan.items.length > 0 && (
                <ol className="mt-6">
                  {plan.items.slice(0, 4).map((item, i) => (
                    <li
                      key={item.id}
                      className="flex items-baseline gap-4 border-b border-white/10 py-3 last:border-0"
                    >
                      <span className="w-5 shrink-0 text-[13px] font-semibold tabular-nums text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                        {item.song}
                      </span>
                      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-background/60">
                        {massPartLabel(item.part)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Youtube className="h-10 w-10 text-gold" />
              <p className="text-sm text-background/70">
                No Mass recording has been posted yet — check back after Sunday.
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 lg:col-span-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-gold">
            Listen &amp; worship
          </span>
          <h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-tight sm:text-[2.5rem] sm:leading-[1.2]">
            Echoes of Praise from St. Paul&apos;s Sanctuary
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-background/75">
            The 11:30 am Mass is streamed live each Sunday and kept here
            afterwards, together with everything we sang that day.
          </p>

          <ul className="mt-8 grid gap-5">
            {STRANDS.map((s) => (
              <li
                key={s.title}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
              >
                <h3 className="font-serif text-lg font-semibold text-gold">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-background/70">
                  {s.blurb}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-5">
            <Link
              href="/masses"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
            >
              <PlayCircle className="h-4 w-4" />
              Watch recorded Masses
            </Link>
            <a
              href={YOUTUBE_HREF}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-background/80 transition-colors hover:text-gold"
            >
              Our channel
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
