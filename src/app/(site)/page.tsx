import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Camera,
  Church,
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
import { Card, CardContent } from "@/components/ui/card";
import { HeroCarousel } from "@/components/hero-carousel";
import { MassOrderSection } from "@/components/mass-order-section";
import { EchoesSection } from "@/components/echoes-section";
import {
  CHOIR,
  formatConcertDate,
  formatConcertTime,
  getUpcomingConcerts,
} from "@/lib/choir";
import { GALLERY_PREVIEW, HERO_CAROUSEL } from "@/lib/images";
import { getConcerts } from "@/lib/server/concerts";
import { getChoir } from "@/lib/server/settings";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Admin-managed hero photos, or the bundled ones when none are set up. */
async function getHeroSlides() {
  try {
    const rows = await prisma.slide.findMany({
      where: { placement: "HERO", isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((r) => ({
        src: r.src,
        alt: r.alt ?? "St. Paul's Chapel Community Choir",
        kicker: r.kicker ?? undefined,
        title: r.title ?? undefined,
        focus: r.focus ?? undefined,
      }));
    }
  } catch {
    // Fall back to bundled photos when the database is unreachable.
  }
  return HERO_CAROUSEL;
}

/** Admin-managed gallery photos, or the bundled ones when none are published. */
async function getGalleryPreview() {
  try {
    const rows = await prisma.galleryItem.findMany({
      where: { kind: "PHOTO", isPublished: true, src: { not: null } },
      orderBy: { sortOrder: "asc" },
      take: 8,
      select: { src: true, alt: true, title: true },
    });
    if (rows.length > 0) {
      return rows.map((r) => ({
        src: r.src as string,
        alt: r.alt ?? r.title ?? "St. Paul's Chapel Community Choir",
      }));
    }
  } catch {
    // Fall back to bundled photos when the database is unreachable.
  }
  return GALLERY_PREVIEW;
}

export default async function HomePage() {
  const [choir, concerts, heroSlides, gallery] = await Promise.all([
    getChoir(),
    getConcerts(),
    getHeroSlides(),
    getGalleryPreview(),
  ]);
  const upcoming = getUpcomingConcerts(concerts).slice(0, 3);

  // Admin-managed, so it can be swapped from the gallery screen without a
  // code change.
  const identityPhoto = gallery[0];

  return (
    <>
      {/* ─────────── Hero ───────────
         Breaks out of the 1200px body cap so the carousel has room to
         breathe on wide screens. */}
      <section className="mx-auto w-full max-w-[1500px] px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col items-start lg:col-span-5">
            <Eyebrow icon={<Sparkles className="h-3.5 w-3.5" />}>
              {choir.tagline}
            </Eyebrow>

            <h1 className="mt-4 font-serif text-[2.375rem] font-semibold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-[3.5rem]">
              St. Paul&apos;s Chapel{" "}
              <span className="block italic font-normal text-primary-deep">
                Community Choir
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {choir.intro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-full bg-primary-container shadow-md hover:bg-primary-deep active:scale-[0.99]"
              >
                <Link href="/join">
                  Join the choir <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-card shadow-sm hover:bg-muted"
              >
                <Link href="/concerts">See upcoming concerts</Link>
              </Button>
            </div>

            <dl className="mt-10 grid w-full grid-cols-3 gap-4 rounded-xl bg-muted/60 p-4">
              <Stat value="40+" label="Years of song" />
              <Stat value="85+" label="Active choristers" tone="gold" />
              <Stat value="SATB" label="Four-part harmony" />
            </dl>
          </div>

          <div className="relative lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <HeroCarousel
                slides={heroSlides}
                className="aspect-[16/10] w-full"
              />
              <span className="pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground shadow-md backdrop-blur-md">
                <span className="h-2.5 w-2.5 animate-ping rounded-full bg-primary-bright" />
                Nairobi Chaplaincy
              </span>
            </div>

            {/* Sits below the image rather than floating over it: the carousel
                renders its own caption in that corner. */}
            <div className="mt-5 flex max-w-sm items-center gap-4 rounded-xl bg-card p-4 shadow-xl">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-subtle text-primary">
                <Church className="h-6 w-6" />
              </span>
              <div>
                <div className="font-serif text-lg font-semibold leading-tight text-primary">
                  {CHOIR.ministersAt.label}
                </div>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Every Sunday at St. Paul&apos;s Chapel, UoN
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Scripture banner ─────────── */}
      <section className="w-full bg-primary-container py-10 text-primary-foreground shadow-inner">
        <div className="container flex max-w-[960px] flex-col items-center text-center">
          <Quote className="h-9 w-9 fill-gold text-gold" />
          <blockquote className="mt-2 max-w-3xl font-serif text-2xl font-normal leading-relaxed tracking-wide sm:text-[2.5rem] sm:leading-[1.2]">
            &ldquo;{CHOIR.verse.text}&rdquo;
          </blockquote>
          <cite className="mt-3 text-[11px] font-bold uppercase not-italic tracking-[0.2em] text-gold">
            — {CHOIR.verse.ref}
          </cite>
        </div>
      </section>

      {/* ─────────── Core ministry pillars ─────────── */}
      <section className="container py-14 sm:py-16">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <Eyebrow icon={<HeartHandshake className="h-3.5 w-3.5" />}>
            What we do
          </Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.2]">
            A choir that prays, performs and serves
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Three rhythms keep us together: weekly Sunday liturgy, seasonal
            concerts and outreach, and a love for the Church&apos;s living song.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Pillar
            icon={<Music2 className="h-6 w-6" />}
            title="Sunday Liturgy"
            description="We animate the 11:30 am Mass every Sunday — prayerful, prepared, and rooted in the missal, leading the congregation into solemn celestial praise."
            footLabel="Weekly celebration"
            linkLabel="View order"
            href="#mass-order"
          />
          <Pillar
            icon={<HeartHandshake className="h-6 w-6" />}
            title="Concerts & Outreach"
            description="From Mater Hospital carols to the African Concert, our voice serves beyond the chapel walls, carrying Christ's mercy into wards, homes and halls."
            footLabel="Seasonal ministry"
            linkLabel="See concerts"
            href="/concerts"
            tone="gold"
          />
          <Pillar
            icon={<Globe2 className="h-6 w-6" />}
            title="The African Church Sings"
            description="Swahili, Latin, English and beyond — a rich repertoire that mirrors our parish family and the many jumuiyas that make it up."
            footLabel="Living tradition"
            linkLabel="Browse repertoire"
            href="/repertoire"
          />
        </div>
      </section>

      {/* ─────────── Community identity ─────────── */}
      <section className="w-full bg-muted py-14 shadow-inner sm:py-16">
        <div className="container grid items-center gap-12 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-card shadow-xl">
              <Image
                src={identityPhoto?.src ?? "/gallery/pic-6.avif"}
                alt={identityPhoto?.alt ?? "The community choir singing"}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-4 top-4 rounded-xl bg-card p-4 text-center shadow-xl">
              <div className="font-serif text-[2.5rem] font-bold leading-none text-primary">
                4
              </div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
                Decades of song
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start lg:col-span-7">
            <Eyebrow icon={<Users className="h-3.5 w-3.5" />}>Who we are</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.2]">
              A community of voices, one body of praise
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {choir.about}
            </p>

            <div className="my-8 grid w-full grid-cols-1 gap-4 rounded-xl bg-card p-6 shadow-sm sm:grid-cols-3">
              <Stat
                value={CHOIR.ministersAt.label.replace(" Sunday Mass", "")}
                label="Sunday Mass"
                size="sm"
              />
              <Stat
                value={choir.rehearsals.day}
                label={`Rehearsals (${choir.rehearsals.time})`}
                tone="gold"
                size="sm"
              />
              <Stat
                value="4+ Tongues"
                label="Swahili, Latin, English"
                size="sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Button
                asChild
                className="gap-2 rounded-full bg-primary-container shadow-sm hover:bg-primary-deep"
              >
                <Link href="/about">
                  Read our story <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/repertoire"
                className="flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-primary"
              >
                Browse repertoire
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MassOrderSection />

      <EchoesSection />

      {/* ─────────── Upcoming concerts ─────────── */}
      <section className="container py-14 sm:py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow icon={<CalendarDays className="h-3.5 w-3.5" />}>
              Upcoming
            </Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.2]">
              Concerts &amp; major liturgies
            </h2>
          </div>
          <Button
            asChild
            variant="outline"
            className="self-start rounded-full border-border bg-card shadow-sm hover:bg-muted sm:self-auto"
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
          <div className="grid gap-6 md:grid-cols-3">
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
                <article
                  key={c.slug}
                  className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full bg-muted">
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover object-[center_top]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                    {c.pinned && (
                      <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="font-serif text-xl font-semibold leading-snug text-foreground">
                      {c.title}
                    </h3>
                    <div className="space-y-1.5 text-[13px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
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
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {c.blurb}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────── Gallery preview ─────────── */}
      <section className="w-full bg-muted py-14 shadow-inner sm:py-16">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow icon={<Camera className="h-3.5 w-3.5" />}>
                In pictures
              </Eyebrow>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.2]">
                Moments from our life together
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="self-start rounded-full border-border bg-card shadow-sm hover:bg-card/70 sm:self-auto"
            >
              <Link href="/gallery">
                Open gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((p) => (
              <Link
                key={p.src}
                href="/gallery"
                className="group relative block aspect-square overflow-hidden rounded-xl border border-border bg-card"
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
      <section className="container py-14 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-2xl bg-muted p-8 text-center shadow-inner sm:p-10">
          <Quote className="mx-auto h-10 w-10 fill-gold text-gold" />
          <blockquote className="mt-5 font-serif text-xl italic leading-relaxed text-primary sm:text-[1.625rem] sm:leading-[2.375rem]">
            {CHOIR.testimonial.quote}
          </blockquote>
          <footer className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
            — {CHOIR.testimonial.attribution}
          </footer>
        </div>
      </section>

      {/* ─────────── Join CTA ─────────── */}
      <section
        id="join"
        className="w-full bg-primary-container py-14 text-primary-foreground sm:py-16"
      >
        <div className="container grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-gold">
              <HeartHandshake className="h-3.5 w-3.5" />
              Join us
            </span>
            <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-[1.2]">
              Lift your voice with ours
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
              Auditions are warm and informal — bring a hymn you love. Come for
              a {choir.rehearsals.day} rehearsal and we&apos;ll take it from
              there.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-full bg-gold text-foreground shadow-md hover:bg-gold/90"
              >
                <Link href="/join">
                  How to join <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a
                  href={`mailto:${CHOIR.email}?subject=I'd%20like%20to%20join%20the%20choir`}
                >
                  <Mail className="h-4 w-4" /> Email us
                </a>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border-primary-foreground/15 bg-primary-foreground/[0.07] text-primary-foreground shadow-2xl">
            <CardContent className="space-y-3 p-6">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-gold">
                <BookOpen className="h-3.5 w-3.5" />
                Media consent form
              </span>
              <p className="text-sm leading-relaxed text-primary-foreground/85">
                We share photos and recordings of choir activities. Members are
                asked to read and return our media consent form.
              </p>
              <Button
                asChild
                className="w-full gap-2 rounded-full bg-gold text-foreground hover:bg-gold/90"
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

function Eyebrow({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-subtle px-4 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">
      {icon}
      {children}
    </span>
  );
}

function Stat({
  value,
  label,
  tone = "crimson",
  size = "lg",
}: {
  value: string;
  label: string;
  tone?: "crimson" | "gold";
  size?: "sm" | "lg";
}) {
  return (
    <div className="flex flex-col">
      <span
        className={[
          "font-serif font-bold leading-tight",
          size === "lg" ? "text-[2rem]" : "text-xl",
          tone === "gold" ? "text-secondary" : "text-primary",
        ].join(" ")}
      >
        {value}
      </span>
      <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-strong">
        {label}
      </span>
    </div>
  );
}

function Pillar({
  icon,
  title,
  description,
  footLabel,
  linkLabel,
  href,
  tone = "crimson",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  footLabel: string;
  linkLabel: string;
  href: string;
  tone?: "crimson" | "gold";
}) {
  return (
    <div className="group flex flex-col justify-between rounded-xl bg-card shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        <span
          className={[
            "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-subtle transition-transform group-hover:scale-110",
            tone === "gold" ? "text-secondary" : "text-primary",
          ].join(" ")}
        >
          {icon}
        </span>
        <h3 className="font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-between rounded-b-xl bg-muted/70 px-6 py-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-strong">
          {footLabel}
        </span>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-deep"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
