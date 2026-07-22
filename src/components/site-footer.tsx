import Link from "next/link";
import { Facebook, Globe, Instagram, Mail, Music2, Twitter, Youtube } from "lucide-react";
import { CHOIR, type ChoirSocial } from "@/lib/choir";

const ICONS: Record<ChoirSocial["icon"], typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  mail: Mail,
  globe: Globe,
};

export function SiteFooter() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Music2 className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold">{CHOIR.shortName}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/75">
            {CHOIR.tagline}. The parish choir at {CHOIR.parish}.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary">
            Explore
          </h3>
          <ul className="mt-3 grid gap-2 text-sm text-background/90">
            <li><Link href="/about" className="hover:text-secondary">About the choir</Link></li>
            <li><Link href="/concerts" className="hover:text-secondary">Concerts &amp; events</Link></li>
            <li><Link href="/join" className="hover:text-secondary">Join the choir</Link></li>
            <li><Link href="/contact" className="hover:text-secondary">Contact us</Link></li>
            <li>
              <a
                href={CHOIR.parishSiteHref}
                target="_blank"
                rel="noreferrer"
                className="hover:text-secondary"
              >
                Parish website ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary">
            Follow &amp; listen
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href={`mailto:${CHOIR.email}`}
                aria-label="Email the choir"
                title="Email the choir"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/10 transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                <Mail className="h-4 w-4" />
              </a>
            </li>
          </ul>
          <p className="mt-3 text-sm text-background/80">
            <a href={`mailto:${CHOIR.email}`} className="hover:text-secondary">
              {CHOIR.email}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-background/15">
        <div className="container flex flex-col gap-2 py-5 text-xs text-background/70 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {CHOIR.name}. All rights reserved.
          </span>
          <span>
            A ministry of {CHOIR.parish}.
          </span>
        </div>
      </div>
    </footer>
  );
}
