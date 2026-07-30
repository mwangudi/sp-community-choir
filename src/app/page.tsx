import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Download,
  Globe2,
  HeartHandshake,
  Mail,
  MapPin,
  Music2,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCarousel } from "@/components/hero-carousel";
import {
  CHOIR,
  formatConcertDate,
  formatConcertTime,
  getUpcomingConcerts,
} from "@/lib/choir";
import { GALLERY_PREVIEW, HERO_CAROUSEL } from "@/lib/images";

export default function HomePage() {
  const upcoming = getUpcomingConcerts().slice(0, 3);

  return (
    <>
      {/* ─────────── Hero ─────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="container relative grid items-center gap-8 py-10 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:py-10">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              {CHOIR.tagline}
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] text-primary sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              {CHOIR.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
              {CHOIR.intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/join">
                  Join the choir <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <Link href="/concerts">See upcoming concerts</Link>
              </Button>
            </div>
          </div>

          <div className="relative lg:col-span-7">
            <HeroCarousel
              slides={HERO_CAROUSEL}
              className="aspect-[16/11] w-full lg:aspect-[16/10]"
            />

            {/* Floating accent card (template-style) */}
            <Card className="absolute -bottom-5 -left-3 hidden w-[240px] border-secondary/30 bg-background/95 shadow-2xl backdrop-blur sm:block lg:-bottom-6 lg:-left-6">
              <CardContent className="flex items-center gap-3 p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Music2 className="h-5 w-5" />
                </span>
                <div className="text-sm leading-tight">
                  <div className="font-serif text-base font-semibold text-primary">
                    {CHOIR.ministersAt.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Every Sunday at St. Paul&apos;s Chapel
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─────────── Verse band ─────────── */}
      <section className="border-b bg-primary py-10 text-primary-foreground">
        <div className="container flex flex-col items-center gap-2 text-center">
          <Quote className="h-7 w-7 text-gold" />
          <blockquote className="max-w-2xl font-serif text-xl leading-snug sm:text-2xl">
            {CHOIR.verse.text}
          </blockquote>
          <cite className="text-xs font-semibold uppercase tracking-widest not-italic text-gold">
            {CHOIR.verse.ref}
          </cite>
        </div>
      </section>

      {/* ─────────── What we do ─────────── */}
      <section className="border-b py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
              What we do
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              A choir that prays, performs and serves
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/80">
              Three rhythms keep us together: weekly Sunday liturgy, seasonal
              concerts and outreach, and a love for the Church&apos;s living song.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<Music2 className="h-5 w-5" />}
              title="Sunday Liturgy"
              description="We animate the 11:30 am Mass every Sunday — prayerful, prepared, and rooted in the missal."
            />
            <FeatureCard
              icon={<HeartHandshake className="h-5 w-5" />}
              title="Concerts & Outreach"
              description="From Mater Hospital carols to the African Concert, our voice serves beyond the chapel walls."
            />
            <FeatureCard
              icon={<Globe2 className="h-5 w-5" />}
              title="The African Church Sings"
              description="Swahili, Latin, English and beyond — a rich repertoire that mirrors our parish family."
            />
          </div>
        </div>
      </section>

      {/* ─────────── Who we are (image + text + stats) ─────────── */}
      <section className="border-b bg-muted/30 py-16 sm:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted shadow-lg">
            <Image
              src="/gallery/pic-6.avif"
              alt="The community choir"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            {/* Floating stat */}
            <div className="absolute right-4 top-4 rounded-2xl bg-background/95 px-4 py-3 text-center shadow-lg backdrop-blur">
              <div className="font-serif text-3xl font-semibold text-primary">
                4
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Decades of song
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
              <Users className="h-3.5 w-3.5" />
              Who we are
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              A community of voices, one body of praise
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/85 sm:text-lg">
              {CHOIR.about}
            </p>

            <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-6">
              <Stat label="Sunday Mass" value="11:30 am" />
              <Stat label="Rehearsals" value={CHOIR.rehearsals.day} />
              <Stat label="Languages" value="4+" />
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/about">
                  Read our story <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link href="/repertoire">Browse repertoire</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Upcoming concerts ─────────── */}
      <section className="border-b py-16 sm:py-20">
        <div className="container">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                <CalendarDays className="h-4 w-4" />
                Upcoming
              </div>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-primary sm:text-4xl">
                Concerts &amp; major liturgies
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="self-start rounded-full sm:self-auto"
            >
              <Link href="/concerts">
                See all concerts <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-muted-foreground">
              No concerts on the calendar right now — check back soon.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {upcoming.map((c, i) => {
                const poster =
                  c.poster ??
                  [
                    "/gallery/pic-3.avif",
                    "/gallery/pic-1.avif",
                    "/gallery/pic-5.avif",
                    "/gallery/pic-2.avif",
                    "/gallery/pic-4.avif",
                  ][i % 5];
                return (
                <Card
                  key={c.slug}
                  className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full bg-muted">
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover object-[center_top]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-primary/10 to-transparent" />
                    {c.pinned && (
                      <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
                        Featured
                      </span>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-primary">
                      {c.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3 pt-0 text-sm">
                    <div className="space-y-1 text-foreground/85">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-secondary" />
                        <span>
                          {formatConcertDate(c.startsAt)} ·{" "}
                          {formatConcertTime(c.startsAt)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                        <span>{c.venue}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{c.blurb}</p>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────── Gallery preview ─────────── */}
      <section className="border-b bg-muted/30 py-16 sm:py-20">
        <div className="container">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
                <Camera className="h-4 w-4" />
                In pictures
              </div>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-primary sm:text-4xl">
                Moments from our life together
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="self-start rounded-full sm:self-auto"
            >
              <Link href="/gallery">
                Open gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* CSS-columns masonry — no extra deps */}
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {GALLERY_PREVIEW.map((p, i) => (
              <Link
                key={p.src}
                href="/gallery"
                className={`group relative block w-full overflow-hidden rounded-2xl bg-muted shadow-sm ${
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                }`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Testimonial ─────────── */}
      <section className="border-b py-16 sm:py-20">
        <div className="container max-w-3xl">
          <Card className="relative overflow-hidden border-secondary/40 bg-secondary/5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl"
            />
            <CardContent className="relative p-7 sm:p-10">
              <Quote className="h-8 w-8 text-secondary" />
              <blockquote className="mt-4 font-serif text-xl leading-snug text-primary sm:text-2xl">
                {CHOIR.testimonial.quote}
              </blockquote>
              <footer className="mt-5 text-sm font-medium text-muted-foreground">
                — {CHOIR.testimonial.attribution}
              </footer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─────────── Join CTA ─────────── */}
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="container grid items-center gap-8 md:grid-cols-[1.3fr,1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              <HeartHandshake className="h-3.5 w-3.5" />
              Join us
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
              Lift your voice with ours
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              Auditions are warm and informal — bring a hymn you love. Come for
              a Monday or Wednesday rehearsal and we&apos;ll take it from there.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Link href="/join">
                  How to join <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a
                  href={`mailto:${CHOIR.email}?subject=I'd%20like%20to%20join%20the%20choir`}
                >
                  <Mail className="h-4 w-4" /> Email us
                </a>
              </Button>
            </div>
          </div>

          {/* Curved-corner card (template signature) */}
          <Card className="overflow-hidden rounded-[24px_72px_24px_24px] border-primary-foreground/15 bg-primary-foreground/[0.06] text-primary-foreground shadow-2xl">
            <CardContent className="space-y-3 p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">
                Media consent form
              </div>
              <p className="text-sm text-primary-foreground/85">
                We share photos and recordings of choir activities. Members are
                asked to read and return our media consent form.
              </p>
              <Button
                asChild
                className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <a href={CHOIR.consentFormHref} download>
                  <Download className="h-4 w-4" /> Download PDF
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group h-full border-border/60 transition-all hover:-translate-y-1 hover:border-secondary/40 hover:shadow-md">
      <CardContent className="space-y-3 p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {icon}
        </span>
        <h3 className="font-serif text-xl font-semibold text-primary">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-serif text-lg font-semibold text-primary sm:text-xl">
        {value}
      </dd>
    </div>
  );
}
