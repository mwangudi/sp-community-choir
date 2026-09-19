"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHOIR } from "@/lib/choir";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };
type NavGroup = { label: string; items: NavLink[] };
type NavEntry = NavLink | NavGroup;

const NAV: NavEntry[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  {
    label: "Music",
    items: [
      { href: "/repertoire", label: "Sacred repertoire" },
      { href: "/masses", label: "Mass music orders" },
      { href: "/propose", label: "Propose songs" },
    ],
  },
  {
    label: "Concerts & Events",
    items: [
      { href: "/concerts", label: "Concerts & liturgies" },
      { href: "/blog", label: "Choir journal" },
    ],
  },
  { href: "/gallery", label: "Gallery" },
  {
    label: "Get Involved",
    items: [
      { href: "/join", label: "Join & auditions" },
      { href: "/support", label: "Support us" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

function isGroup(e: NavEntry): e is NavGroup {
  return "items" in e;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 bg-background/95 shadow-[0_1px_8px_rgba(45,30,85,0.04)] backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 flex-col leading-tight">
          <span className="whitespace-nowrap font-serif text-base font-semibold tracking-tight text-primary transition-colors group-hover:text-primary-deep lg:text-lg">
            St. Paul&apos;s Community Choir
          </span>
          <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
            {CHOIR.tagline} • UoN Chaplaincy
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) =>
            isGroup(item) ? (
              <NavDropdown key={item.label} group={item} isActive={isActive} />
            ) : (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  isActive(item.href)
                    ? "bg-primary-container text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden shrink-0 xl:block">
          <Button
            asChild
            size="sm"
            className="gap-1.5 rounded-full bg-primary-container px-5 hover:bg-primary-deep"
          >
            <Link href="/join">
              Join the Choir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border xl:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-t bg-background xl:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="container flex flex-col gap-1 py-3">
          {NAV.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="pt-2">
                <span className="block px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </span>
                {item.items.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(sub.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm font-medium",
                      isActive(sub.href)
                        ? "bg-secondary/20 text-secondary"
                        : "hover:bg-muted",
                    )}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  isActive(item.href)
                    ? "bg-secondary/20 text-secondary"
                    : "hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
          <Button asChild className="mt-3 rounded-full">
            <Link href="/join" onClick={() => setOpen(false)}>
              Join the Choir
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavDropdown({
  group,
  isActive,
}: {
  group: NavGroup;
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const anyActive = group.items.some((i) => isActive(i.href));

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
          anyActive
            ? "bg-primary-container text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {group.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <div className="min-w-[12rem] rounded-xl border bg-background p-1.5 shadow-lg">
            {group.items.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(sub.href) ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(sub.href)
                    ? "bg-secondary/20 text-secondary"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
