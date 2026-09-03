import type { Metadata } from "next";
import {
  CalendarDays,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Music2,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHOIR, type ChoirSocial } from "@/lib/choir";
import { getChoir } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

const ICONS: Record<ChoirSocial["icon"], typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  mail: Mail,
  globe: Globe,
};

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Email, social media and rehearsal venue for St. Paul's Chapel Community Choir.",
};

export default async function ContactPage() {
  const { email, rehearsals } = await getChoir();

  return (
    <>
      <section className="border-b bg-muted/30 py-14 sm:py-16">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            <Mail className="h-3.5 w-3.5" />
            Contact
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-primary sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            Whether you want to join, invite us to sing at a concert, or just say hello — we
            love hearing from you.
          </p>
        </div>
      </section>

      <section className="border-b py-14 sm:py-16">
        <div className="container grid max-w-5xl gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <Mail className="h-5 w-5 text-secondary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground">
                For joining, concert bookings, partnerships and general questions.
              </p>
              <Button asChild className="mt-4 rounded-full">
                <a href={`mailto:${email}`}>{email}</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <CalendarDays className="h-5 w-5 text-secondary" />
                Rehearsals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="font-medium text-foreground">{rehearsals.day}</div>
              <div className="text-muted-foreground">{rehearsals.time}</div>
              <div className="text-muted-foreground">
                {rehearsals.sundayWarmUp}
              </div>
              <div className="flex items-center gap-2 pt-2 text-foreground">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>{rehearsals.venue}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <Music2 className="h-5 w-5 text-secondary" />
                Follow &amp; listen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CHOIR.socials.map((s) => {
                  const Icon = ICONS[s.icon];
                  return (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-md border bg-card p-3 text-sm transition-colors hover:border-secondary hover:bg-secondary/5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground">{s.label}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {s.href.replace(/^https?:\/\//, "")}
                          </div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-secondary/30 bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Parish website</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-foreground/85">
                Looking for Mass times, sacraments, or other parish ministries? Visit{" "}
                <a
                  href={CHOIR.parishSiteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {CHOIR.parish} ↗
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
