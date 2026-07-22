"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Music2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHOIR } from "@/lib/choir";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };
type NavGroup = { label: string; items: NavLink[] };
type NavEntry = NavLink | NavGroup;

const NAV: NavEntry[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  {
    label: "Music",
    items: [
      { href: "/repertoire", label: "Repertoire" },
      { href: "/propose", label: "Propose songs" },
    ],
  },
  {
    label: "Events",
    items: [
      { href: "/concerts", label: "Concerts" },
      { href: "/gallery", label: "Gallery" },
    ],
  },
  {
    label: "Get involved",
    items: [
      { href: "/join", label: "Join the choir" },
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
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Music2 className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-base font-semibold text-primary sm:text-lg">
              {CHOIR.shortName}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-[11px]">
              St. Paul&apos;s Chapel · UoN
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) =>
            isGroup(item) ? (
              <NavDropdown key={item.label} group={item} isActive={isActive} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-secondary/20 text-secondary"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/join">Join the choir</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-t bg-background md:hidden",
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
                key={item.href}
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
              Join the choir
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
          "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          anyActive
            ? "bg-secondary/20 text-secondary"
            : "text-foreground/80 hover:bg-muted hover:text-foreground",
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
