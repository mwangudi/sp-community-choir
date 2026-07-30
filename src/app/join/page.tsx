import type { Metadata } from "next";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinForm } from "@/components/join-form";
import { CHOIR } from "@/lib/choir";

export const metadata: Metadata = {
  title: "Join the choir",
  description:
    "How to join St. Paul's Chapel Community Choir — rehearsal times, what to expect, and the media consent form.",
};

const STEPS = [
  {
    title: "Come to a rehearsal",
    body: `Drop in on a ${CHOIR.rehearsals.day.toLowerCase()} rehearsal between ${CHOIR.rehearsals.time}. No need to book — just arrive about 10 minutes early.`,
  },
  {
    title: "Sing with us",
    body: "We'll place you in a voice section (soprano, alto, tenor, bass) and you'll learn alongside us. A short, warm audition piece is welcome but not required.",
  },
  {
    title: "Sign the media consent form",
    body: "We sometimes record or photograph rehearsals and concerts. Members are asked to read and return our short media consent form before joining a public performance.",
  },
  {
    title: "Serve at Sunday Mass",
    body: `Once you're settled, you'll join us for the ${CHOIR.ministersAt.label} warm-up at ${CHOIR.rehearsals.sundayWarmUp.toLowerCase()}.`,
  },
];

export default function JoinPage() {
  return (
    <>
      <section className="border-b bg-primary text-primary-foreground">
        <div className="container max-w-4xl py-6 sm:py-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold">
            <HeartHandshake className="h-3.5 w-3.5" />
            Join the choir
          </div>
          <h1 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
            Lift your voice with ours
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/85">
            We welcome new members every term — students, working professionals,
            resident parishioners. If you can carry a tune and you love the
            liturgy, you have a home with us.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button asChild size="lg" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <a href="#apply">
                <Send className="h-4 w-4" /> Apply now
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <a href={`mailto:${CHOIR.email}?subject=I'd%20like%20to%20join%20the%20choir`}>
                <Mail className="h-4 w-4" /> Email us
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href={CHOIR.consentFormHref} download>
                <Download className="h-4 w-4" /> Download consent form
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="apply" className="border-b py-14 sm:py-16">
        <div className="container grid max-w-6xl gap-10 lg:grid-cols-12">
          {/* Steps */}
          <div className="lg:col-span-5">
            <h2 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
              How to join — four small steps
            </h2>
            <ol className="mt-6 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-primary">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/85 sm:text-base">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
                <Send className="h-3.5 w-3.5" />
                Apply to join
              </div>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-primary sm:text-3xl">
                Come sing with us
              </h2>
              <p className="mt-2 text-sm text-foreground/80">
                Tell us a little about yourself and we&apos;ll be in touch with
                the next steps.
              </p>
            </div>
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <JoinForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rehearsals + What we look for */}
      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container grid max-w-5xl gap-5 md:grid-cols-2">
          <Card className="border-secondary/30 bg-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <CalendarDays className="h-4 w-4 text-secondary" />
                Rehearsals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-sm">
              <div className="font-medium text-foreground">
                {CHOIR.rehearsals.day}
              </div>
              <div className="text-muted-foreground">
                {CHOIR.rehearsals.time}
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{CHOIR.rehearsals.sundayWarmUp}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{CHOIR.rehearsals.venue}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-primary">
                What we look for
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-sm">
              {[
                "A love for the liturgy",
                "A willingness to commit to weekly rehearsals",
                "An ear that can match pitch (we'll help you train it)",
                "A spirit of fellowship",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-foreground/85"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-3xl text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-secondary" />
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
            Still have questions?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
            Reach out — we&apos;ll answer with the same warmth we sing with.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full">
            <a href={`mailto:${CHOIR.email}`}>
              <Mail className="h-4 w-4" /> {CHOIR.email}
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
