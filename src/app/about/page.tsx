import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, History, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHOIR } from "@/lib/choir";

export const metadata: Metadata = {
  title: "About",
  description: `${CHOIR.about} ${CHOIR.history}`,
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            About the choir
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            One voice from many jumuiyas
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground/85">
            {CHOIR.intro}
          </p>
        </div>
      </section>

      <section className="border-b py-14 sm:py-16">
        <div className="container grid max-w-5xl gap-10 md:grid-cols-[1.4fr,1fr]">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
              Who we are
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
              {CHOIR.about}
            </p>

            <h2 className="mt-10 font-serif text-2xl font-semibold text-primary sm:text-3xl">
              Our story
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
              {CHOIR.history}
            </p>
          </div>

          <Card className="self-start border-secondary/30 bg-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <History className="h-4 w-4 text-secondary" />
                At a glance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                  Tagline
                </div>
                <div className="font-medium text-foreground">{CHOIR.tagline}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                  Verse
                </div>
                <blockquote className="font-serif italic text-foreground">
                  &ldquo;{CHOIR.verse.text}&rdquo;
                  <footer className="mt-1 text-xs not-italic text-muted-foreground">
                    — {CHOIR.verse.ref}
                  </footer>
                </blockquote>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                  We minister at
                </div>
                <div className="font-medium text-foreground">{CHOIR.ministersAt.label}</div>
                <div className="text-xs text-muted-foreground">{CHOIR.ministersAt.note}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                  Parish
                </div>
                <a
                  href={CHOIR.parishSiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {CHOIR.parish} ↗
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-5xl">
          <div className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary">
            <Trophy className="h-4 w-4" />
            Through the years
          </div>
          <h2 className="font-serif text-3xl font-semibold text-primary sm:text-4xl">
            Highlights and traditions
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CHOIR.highlights.map((h) => (
              <Card key={h.title}>
                <CardHeader className="pb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                    {h.when}
                  </span>
                  <CardTitle className="text-lg text-primary">{h.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {h.blurb}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b py-14 sm:py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-primary sm:text-4xl">
            Want to sing with us?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
            Rehearsals are {CHOIR.rehearsals.day.toLowerCase()}, {CHOIR.rehearsals.time}. Come as
            you are — bring a hymn you love.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link href="/join">How to join <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
