# St. Paul's Chapel Community Choir — Website

Standalone website for **St. Paul's Catholic Chapel Community Choir** at the
University of Nairobi. Built with Next.js 15 (App Router), React 19, Tailwind 3,
and a small shadcn-style UI kit.

This site is intentionally independent of the main parish website so the choir
can ship and iterate without waiting on PPC approval cycles.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3100>.

Useful scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 3100 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 3100 |
| `npm run typecheck` | TypeScript check without emit |
| `npm run lint` | Next.js ESLint |

## Structure

```
src/
  app/
    layout.tsx          ← root layout, fonts, robots flag
    globals.css         ← Tailwind + design tokens
    page.tsx            ← Home (/)
    about/page.tsx      ← /about
    concerts/page.tsx   ← /concerts
    join/page.tsx       ← /join
    contact/page.tsx    ← /contact
  components/
    site-header.tsx
    site-footer.tsx
    ui/                 ← Button, Card, Badge primitives
  lib/
    choir.ts            ← single source of truth: choir info + concerts
    utils.ts            ← cn(), formatDate()
public/
  community-choir-media-consent.pdf
```

## Editing content

All copy, rehearsal times, social links and concerts live in
[`src/lib/choir.ts`](src/lib/choir.ts). Update that file and the changes ripple
across every page.

To add a concert, append to the `CONCERTS` array:

```ts
{
  slug: "advent-recital-2026",
  title: "Advent Recital",
  startsAt: "2026-12-05T18:30:00+03:00",
  venue: "St. Paul's Catholic Chapel",
  blurb: "An evening of Advent reflections in word and song.",
}
```

The `Upcoming` / `Recent` split on `/concerts` is computed from `startsAt`.

## Deployment

This repo is designed to deploy to **Vercel** as a separate project from the
parish website.

1. Push to a Git host (GitHub / GitLab).
2. Import into Vercel.
3. No env vars are required for the first deploy. To temporarily hide the site
   from search engines, set `NEXT_PUBLIC_ALLOW_INDEXING=false`.

## Relationship to the parish website

The parish website also hosts a choir page at
<https://www.stpaulschapelnbi.org/choirs/community>. Both pages share the same
content (kept in sync manually for now). The standalone site is the choir's
authoritative public presence.
