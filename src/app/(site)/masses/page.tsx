import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Music2, Youtube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { massPartLabel } from "@/lib/mass-parts";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sunday Masses",
  description:
    "Watch recordings of the 11:30 am Sunday Mass at St. Paul's Catholic Chapel, with the songs the Community Choir sang.",
};

export default async function MassesPage() {
  const plans = await prisma.massPlan.findMany({
    where: { status: "PUBLISHED", youtubeId: { not: null } },
    orderBy: { date: "desc" },
    take: 24,
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <>
      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <Youtube className="h-3.5 w-3.5" />
            Sunday Masses
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            Watch the Mass again
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            The 11:30 am Sunday Mass is streamed live. Recordings are posted here
            afterwards, together with the songs we sang that day.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container max-w-4xl">
          {plans.length === 0 ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Youtube className="h-4 w-4" />
              No recordings have been posted yet — check back after Sunday.
            </p>
          ) : (
            <div className="space-y-12">
              {plans.map((plan) => (
                <article key={plan.id}>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-secondary" />
                    {formatDate(plan.date)}
                    <Badge variant="outline">Year {plan.year}</Badge>
                    {plan.setting && <Badge variant="secondary">{plan.setting}</Badge>}
                  </div>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-primary sm:text-3xl">
                    {plan.name}
                  </h2>

                  <div className="mt-5 aspect-video overflow-hidden rounded-lg border bg-black">
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
                    <Card className="mt-5">
                      <CardContent className="pt-6">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-secondary">
                          <Music2 className="h-3.5 w-3.5" />
                          What we sang
                        </h3>
                        <dl className="mt-4 grid gap-x-10 sm:grid-cols-2">
                          {plan.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-baseline justify-between gap-4 border-b py-1.5"
                            >
                              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {massPartLabel(item.part)}
                              </dt>
                              <dd className="text-right text-sm">{item.song}</dd>
                            </div>
                          ))}
                        </dl>
                      </CardContent>
                    </Card>
                  )}
                </article>
              ))}
            </div>
          )}

          <p className="mt-12 text-sm text-muted-foreground">
            Looking for the music itself?{" "}
            <Link href="/repertoire" className="font-medium text-primary hover:underline">
              Browse the repertoire
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
