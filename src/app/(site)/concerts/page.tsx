import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatConcertDate,
  formatConcertTime,
  getPastConcerts,
  getUpcomingConcerts,
} from "@/lib/choir";
import { getConcerts } from "@/lib/server/concerts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Concerts & events",
  description:
    "Upcoming and recent concerts, major liturgies and choir performances at St. Paul's Catholic Chapel.",
};

export default async function ConcertsPage() {
  const concerts = await getConcerts();
  const upcoming = getUpcomingConcerts(concerts);
  const past = getPastConcerts(concerts);

  return (
    <>
      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <CalendarDays className="h-3.5 w-3.5" />
            Concerts &amp; events
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            Where you can hear us next
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            Concerts, major liturgies and seasonal traditions. All times East Africa Time.
          </p>
        </div>
      </section>

      <section className="border-b py-14 sm:py-16">
        <div className="container">
          <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-6 text-muted-foreground">
              Nothing on the calendar right now — check back soon, or{" "}
              <a href="/contact" className="text-primary underline-offset-4 hover:underline">
                ask us
              </a>{" "}
              what we&apos;re rehearsing.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((c) => (
                <ConcertCard key={c.slug} concert={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="border-b bg-muted/30 py-14 sm:py-16">
          <div className="container">
            <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
              Recent
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.map((c) => (
                <ConcertCard key={c.slug} concert={c} muted />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function ConcertCard({
  concert,
  muted,
}: {
  concert: ReturnType<typeof getUpcomingConcerts>[number];
  muted?: boolean;
}) {
  return (
    <Card className={muted ? "opacity-90" : undefined}>
      <CardHeader className="pb-3">
        {concert.pinned && !muted && (
          <span className="mb-2 self-start rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
            Featured
          </span>
        )}
        <CardTitle className="text-lg text-primary">{concert.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 text-sm">
        <div className="space-y-1 text-foreground/85">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-secondary" />
            <span>
              {formatConcertDate(concert.startsAt)} · {formatConcertTime(concert.startsAt)}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            <span>{concert.venue}</span>
          </div>
        </div>
        <p className="text-muted-foreground">{concert.blurb}</p>
      </CardContent>
    </Card>
  );
}
