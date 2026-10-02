import Link from "next/link";
import {
  BookOpen,
  Facebook,
  Globe,
  Instagram,
  Mail,
  Twitter,
  Youtube,
} from "lucide-react";
import { CHOIR, type ChoirSocial } from "@/lib/choir";
import { SITE_URL } from "@/lib/site";

const ICONS: Record<ChoirSocial["icon"], typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  mail: Mail,
  globe: Globe,
};

const NAVIGATION = [
  { href: "/about", label: "About the choir" },
  { href: "/repertoire", label: "Sacred repertoire & orders" },
  { href: "/concerts", label: "Concerts & liturgies" },
  { href: "/join", label: "Join & auditions" },
  { href: CHOIR.consentFormHref, label: "Media consent form" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/contact", label: "Contact secretariat" },
];

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
      {children}
    </span>
  );
}

export function SiteFooter() {
  const host = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <footer className="w-full bg-muted pb-8 pt-12 text-foreground shadow-[0_-1px_8px_rgba(45,30,85,0.03)]">
      <div className="container">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <span className="font-serif text-xl font-semibold text-primary">
              St. Paul&apos;s Community Choir
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
              {host}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              A liturgical sacred music ministry of {CHOIR.parish}, dedicated to
              reverent worship, choral excellence and gospel evangelization.
            </p>
            <a
              href={`mailto:${CHOIR.email}`}
              className="mt-2 flex items-center gap-2 break-all text-[13px] text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              {CHOIR.email}
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <ColumnHeading>Liturgical schedule</ColumnHeading>
            <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(45,30,85,0.04)]">
              <div className="mb-3">
                <div className="font-serif text-2xl font-bold leading-tight text-primary">
                  11:30 am
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Sunday community Mass
                </div>
              </div>
              <div>
                <div className="font-serif text-lg font-semibold leading-tight text-secondary">
                  {CHOIR.rehearsals.time}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  {CHOIR.rehearsals.day} rehearsals
                </div>
              </div>
            </div>
            <p className="text-[13px] text-muted-strong">
              St. Paul&apos;s Chapel, University Way, Nairobi
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <ColumnHeading>Choir navigation</ColumnHeading>
            <ul className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
              {NAVIGATION.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <ColumnHeading>Sacred communal song</ColumnHeading>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Follow recordings, live-streamed liturgies and hymn studies across
              our pastoral channels.
            </p>
            <ul className="mt-1 flex flex-wrap items-center gap-2">
              {CHOIR.socials.map((s) => {
                const Icon = ICONS[s.icon];
                return (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary shadow-[0_1px_4px_rgba(45,30,85,0.04)] transition-colors hover:bg-gold-subtle"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
            <a
              href="https://stpaulspsalter.wordpress.com/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded bg-gold-subtle px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-secondary transition-opacity hover:opacity-85"
            >
              <BookOpen className="h-4 w-4" />
              The Psalter • Nairobi edition
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[13px] text-muted-strong sm:flex-row">
          <p>
            © {new Date().getFullYear()} {CHOIR.name}. All rights reserved.
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">
            A ministry of {CHOIR.parish}
          </p>
        </div>
      </div>
    </footer>
  );
}
