"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  ListMusic,
  Music2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IMAGES } from "@/lib/images";
import {
  formatSunday,
  liturgicalContext,
  seasonLabel,
  type LiturgicalSeason,
} from "@/lib/liturgical";
import {
  ALL_LANGUAGES,
  ALL_MASS_PARTS,
  ALL_SEASONS,
  DRIVE_DATABASE_URL,
  massPartLabel,
  searchSongs,
  songDriveUrl,
  songsForSunday,
  type MassPart,
  type Song,
  type SongLanguage,
} from "@/lib/songs";
import { orderedItems, type MassPlan } from "@/lib/mass-plans";
import { cn } from "@/lib/utils";

export default function RepertoireBrowser({
  signedIn,
  songs,
  plan,
}: {
  signedIn: boolean;
  songs: Song[];
  plan: MassPlan | null;
}) {
  const ctx = useMemo(() => liturgicalContext(new Date()), []);
  const suggested = useMemo(() => songsForSunday(ctx, songs), [ctx, songs]);

  const planItems = useMemo(() => {
    if (!plan) return [];
    const norm = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    const index = new Map<string, string>();
    for (const s of songs) {
      index.set(norm(s.title), s.slug);
      for (const a of s.aliases ?? []) index.set(norm(a), s.slug);
    }
    return orderedItems(plan).map((it) => ({
      ...it,
      slug: index.get(norm(it.song)),
    }));
  }, [plan, songs]);

  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<LiturgicalSeason | null>(null);
  const [massPart, setMassPart] = useState<MassPart | null>(null);
  const [language, setLanguage] = useState<SongLanguage | null>(null);

  const filtered = useMemo(
    () =>
      searchSongs(songs, {
        query,
        season: season ?? undefined,
        massPart: massPart ?? undefined,
        language: language ?? undefined,
      }),
    [songs, query, season, massPart, language],
  );

  const hasFilters = !!(query || season || massPart || language);

  return (
    <>
      {/* Hero — 2-col with sheet-music image */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="container relative grid items-center gap-8 py-10 sm:py-12 lg:grid-cols-12 lg:gap-12 lg:py-6">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
              <Music2 className="h-3.5 w-3.5" />
              Repertoire
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] text-primary sm:text-5xl lg:text-[3.25rem]">
              Our song database
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
              Searchable index of every hymn, motet and Mass setting in the
              choir&apos;s repertoire. Filter by liturgical season, Mass part or
              language — or jump straight to the songs that fit this Sunday.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {signedIn ? (
                <>
                  Scores and MIDI files live in our{" "}
                  <a
                    href={DRIVE_DATABASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Google Drive database
                    <ExternalLink className="ml-0.5 inline h-3 w-3" />
                  </a>
                  .
                </>
              ) : (
                <>
                  Scores and MIDI files are shared with choir members only.{" "}
                  <Link
                    href="/admin/login?next=/repertoire"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Members sign in
                  </Link>
                  .
                </>
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href="#search">
                  <Search className="h-4 w-4" /> Search the catalogue
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full"
              >
                <a href="#this-sunday">This Sunday&apos;s songs</a>
              </Button>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted shadow-xl sm:aspect-[16/10] lg:aspect-[16/11]">
              <Image
                src={IMAGES.sheetMusic}
                alt="Sheet music on a piano"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent" />
            </div>
            <Card className="absolute -bottom-5 -left-3 hidden w-[240px] border-secondary/30 bg-background/95 shadow-2xl backdrop-blur sm:block lg:-bottom-6 lg:-left-6">
              <CardContent className="flex items-center gap-3 p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Music2 className="h-5 w-5" />
                </span>
                <div className="text-sm leading-tight">
                  <div className="font-serif text-base font-semibold text-primary">
                    {songs.length} songs catalogued
                  </div>
                  <div className="text-xs text-muted-foreground">
                    4+ languages · all seasons
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* This Sunday */}
      <section
        id="this-sunday"
        className="relative overflow-hidden border-b bg-primary text-primary-foreground"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
        />
        <div className="container relative py-10 sm:py-12">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                <CalendarDays className="h-3.5 w-3.5" />
                This Sunday
              </div>
              <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
                {ctx.name}
              </h2>
              <p className="mt-2 text-sm opacity-90 sm:text-base">
                {formatSunday(ctx.date)} · {seasonLabel(ctx.season)} · Year{" "}
                {ctx.year}
              </p>
            </div>
            <div className="text-sm opacity-90">
              <span className="rounded-full bg-primary-foreground/15 px-3 py-1 font-semibold uppercase tracking-widest">
                Liturgical colour: {ctx.color}
              </span>
            </div>
          </div>

          <div className="mt-8">
            {plan ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="mr-1 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest opacity-80">
                    <ListMusic className="h-4 w-4" />
                    Order of service
                  </h3>
                  {plan.setting && (
                    <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
                      Mass setting: {plan.setting}
                    </span>
                  )}
                  {plan.leader && (
                    <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
                      Leader: {plan.leader}
                    </span>
                  )}
                </div>
                <ol className="mt-4 grid gap-x-10 gap-y-0 sm:grid-cols-2">
                  {planItems.map((it, i) => (
                    <li
                      key={`${it.part}-${i}`}
                      className="flex items-baseline justify-between gap-4 border-b border-primary-foreground/15 py-2"
                    >
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide opacity-70">
                        {it.part}
                      </span>
                      {it.slug ? (
                        <Link
                          href={`/repertoire/${it.slug}`}
                          className="text-right text-sm font-medium underline-offset-4 hover:underline"
                        >
                          {it.song}
                        </Link>
                      ) : (
                        <span className="text-right text-sm font-medium">
                          {it.song}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs opacity-70">
                  From the choir&apos;s Liturgical Selections worksheet.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-widest opacity-80">
                  Suggested from the repertoire
                </h3>
                {suggested.length === 0 ? (
                  <p className="mt-3 text-sm opacity-90">
                    No tagged matches yet — add songs to start building Sunday
                    playlists.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggested.slice(0, 8).map((s) => (
                      <Link
                        key={s.slug}
                        href={`/repertoire/${s.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary-foreground/25"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {s.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-primary-foreground/15 pt-5">
            <p className="text-sm opacity-90">
              Want a say in what we sing? Propose songs for an upcoming Sunday.
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/propose">
                <ListMusic className="h-4 w-4" /> Propose songs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Search + filters */}
      <section id="search" className="border-b bg-muted/30 py-10">
        <div className="container">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-6 p-5 sm:p-7">
              {/* Top row: search bar + active count + clear */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search title, composer or a line of the lyrics…"
                    aria-label="Search the repertoire"
                    className="h-11 w-full rounded-full border bg-background pl-10 pr-3 text-base shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground sm:shrink-0">
                  <span>
                    <span className="font-semibold text-primary">
                      {filtered.length}
                    </span>{" "}
                    of {songs.length}
                  </span>
                  {hasFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery("");
                        setSeason(null);
                        setMassPart(null);
                        setLanguage(null);
                      }}
                      className="rounded-full"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter groups */}
              <div className="grid gap-5 border-t border-border pt-5 md:grid-cols-2 xl:grid-cols-3">
                <FilterGroup
                  label="Season"
                  values={ALL_SEASONS}
                  value={season}
                  onChange={setSeason}
                  format={seasonLabel}
                />
                <FilterGroup
                  label="Language"
                  values={ALL_LANGUAGES}
                  value={language}
                  onChange={setLanguage}
                  format={(v) => v}
                />
                <FilterGroup
                  label="Mass part"
                  values={ALL_MASS_PARTS}
                  value={massPart}
                  onChange={setMassPart}
                  format={massPartLabel}
                  className="md:col-span-2 xl:col-span-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 sm:py-16">
        <div className="container">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
              {hasFilters ? "Matching songs" : "All songs"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-8 text-muted-foreground">
              No songs match those filters. Try clearing one.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <li key={s.slug}>
                  <Card className="group h-full border-border/60 transition-all hover:-translate-y-1 hover:border-secondary/40 hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="font-serif text-xl text-primary">
                        <Link
                          href={`/repertoire/${s.slug}`}
                          className="hover:underline"
                        >
                          {s.title}
                        </Link>
                      </CardTitle>
                      {(s.composer || s.language) && (
                        <CardDescription>
                          {[s.composer, s.language].filter(Boolean).join(" · ")}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-1.5 pt-0">
                      {s.seasons.map((sn) => (
                        <Badge key={sn} variant="secondary">
                          {seasonLabel(sn)}
                        </Badge>
                      ))}
                      {s.massParts.slice(0, 2).map((mp) => (
                        <Badge key={mp} variant="outline">
                          {massPartLabel(mp)}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  values,
  value,
  onChange,
  format,
  className,
}: {
  label: string;
  values: readonly T[];
  value: T | null;
  onChange: (v: T | null) => void;
  format: (v: T) => string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            reset
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((v) => {
          const active = v === value;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(active ? null : v)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-secondary/40 hover:bg-secondary/10",
              )}
            >
              {format(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
