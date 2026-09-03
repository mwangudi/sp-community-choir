# Admin & backend — what was built

Reference for the backend and admin panel added to the choir website.
Everything here lives in the same Next.js app; there is no separate server.

---

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Public site + admin + server actions in one deploy |
| Database | MySQL 8 | Local dev via the `MySQL80` service |
| ORM | Prisma 6 | v7 drops `url` from the schema and needs a driver adapter, so we stayed on 6 |
| Auth | `jose` (JWT) + `bcryptjs` | JWT verifies in middleware; bcrypt at 12 rounds |
| Validation | Zod 4 | One schema module shared by public forms and admin |
| Admin UI | MUI 9 | Materio-inspired theme in the choir's colours |
| Editor | TipTap 3 | Rich text for blog posts |
| Uploads | Vercel Blob, local disk fallback | Switches automatically |

The public site keeps **Tailwind**; MUI is scoped to `/admin` only.

---

## Routes

```
src/app/
  (site)/          public pages — Tailwind, site header/footer
  admin/           admin — MUI providers, no public chrome
    login/         blank layout (split screen + carousel)
    (dashboard)/   authenticated shell (sidebar + navbar)
  api/admin/logout
```

Public pages moved into the `(site)` route group so `/admin` no longer inherits
the site header and footer. Route groups do not change URLs.

---

## Data model

`prisma/schema.prisma` — 14 models.

- **User** — email, password hash, role (`ADMIN` / `TECHNICAL` / `MEMBER`), voice, active flag
- **Song** — the repertoire, plus rights fields (see Copyright below)
- **MassPlan** / **MassPlanItem** — a Sunday's order of service, one row per part
- **SongProposal** / **SongProposalItem** — member submissions and their review state
- **Concert**, **GalleryItem**, **Member**, **JoinApplication**, **Feedback**
- **Post** — blog entries
- **Slide** — photos for the admin sign-in carousel and the homepage hero (`placement`)

MySQL has no scalar arrays, so list-like fields (`aliases`, `seasons`, `tags`…)
are stored as JSON columns.

### Commands

```bash
npm run db:migrate   # create + apply a migration
npm run db:seed      # import existing songs, plans, concerts, gallery
npm run db:studio    # browse the data
```

`prisma migrate dev` runs the seed automatically. The seed only resets the admin
password when `SEED_ADMIN_PASSWORD` is set explicitly, so re-seeding will not
silently change a live password.

---

## Auth

- Password hashing with bcrypt (12 rounds).
- Session is a signed JWT in an **httpOnly, SameSite=Lax** cookie (`Secure` in production), 8-hour expiry.
- `src/middleware.ts` guards every `/admin/*` route and bounces signed-out users to the login page, preserving the intended destination.
- `requireSession(role)` protects server components and actions. Roles are ranked `MEMBER < TECHNICAL < ADMIN`.
- Login returns the same message for an unknown email and a wrong password, so accounts cannot be enumerated.

---

## Admin panel

Materio's shape language (soft radii, layered shadows, gradient active states)
rendered in **cardinal red `#BC0424`** and **amber gold `#FDB321`** rather than
Materio's purple.

**Sidebar**
- Grouped menus with submenus: Dashboard · Music · Content · People
- Active item uses a gradient pill with a soft shadow; the parent group carries that state while collapsed
- The group containing the current page opens automatically
- Collapsible to a 72px icon rail; the choice is remembered in `localStorage`
- On the rail, clicking a group opens a flyout of its children
- Below `lg` the drawer becomes a temporary overlay

**Pages**
- **Dashboard** — greeting banner, four colour-coded stat cards, next Sunday's plan
- **Song proposals** — status filters, full order of service per submission, one-click review
- **Applications** — consent evidence and status changes, plus erase-record
- **Blog** — list, editor, publish/unpublish, delete
- **Login carousel** — upload, reorder, hide, delete

---

## Copyright & scores

Scores and MIDI were previously linked publicly. Now:

- `Song` carries `copyrightStatus` (`PUBLIC_DOMAIN` / `LICENSED` / `COPYRIGHTED` / `UNKNOWN`), `rightsHolder`, `licenceRef`, `sourceUrl`, `rightsCheckedAt`.
- **Drive links only render for signed-in members.** Public-domain works stay open to everyone.
- Every song page shows a rights notice. `UNKNOWN` is the default, so anything unreviewed is restricted rather than exposed — this doubles as the review queue.
- The repertoire hero no longer links the Drive database to the public.

---

## Privacy & consent

Written against Kenya's **Data Protection Act, 2019**.

- **`/privacy`** — what we collect, why, media consent, retention, rights, children. Linked in the footer and sitemap.
- The **Join form now writes to the database** (it was mailto-only, so consent was never recorded). Two checkboxes: privacy (required) and media (optional).
- Each application stores `privacyConsent`, `mediaConsent`, `consentVersion` and `consentAt` as evidence.
- Consent wording lives in `src/lib/consent.ts` with a version stamp — bump `CONSENT_VERSION` whenever the wording changes.
- The Applications page shows consent chips and offers **erase record** for right-to-erasure requests.

---

## Blog

Admin-authored only — there is no public submission route.

- Public `/blog` with category filters (News · Events · Reflections · Patron saints) and `/blog/[slug]` with OpenGraph tags.
- Draft → publish flow, auto-generated slugs with collision handling, excerpt, tags, cover image.
- **Rich text** via TipTap: bold, italic, strikethrough, H2/H3, lists, quote, code, rule, links, undo/redo.
- Bodies are stored as HTML and **sanitised server-side on save and again on render** (`src/lib/sanitize.ts`) with a strict tag allow-list. This matters because the body is injected with `dangerouslySetInnerHTML`.
- Editor and published page share the `.choir-prose` stylesheet, so what you type is what you get.
- Legacy plain-text bodies are converted to paragraphs automatically.

---

## Uploads

`src/lib/storage.ts` exposes `saveImage()` / `deleteImage()`.

- With `BLOB_READ_WRITE_TOKEN` set, files go to **Vercel Blob**.
- Without it, files are written to `public/uploads/` for local development.
- Validation: type allow-list (JPG/PNG/WebP/AVIF), 5 MB cap, and **UUID filenames** — the client-supplied name is never used, which avoids path traversal.

Vercel's filesystem is read-only, so a Blob store is required in production.

---

## Environment

Copy `.env.example` to `.env`:

```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/stpauls_choir"
JWT_SECRET="a long random string, 32+ characters"
JWT_EXPIRES_IN="8h"
NEXT_PUBLIC_SITE_URL="http://localhost:3100"
NEXT_PUBLIC_ALLOW_INDEXING="false"
# BLOB_READ_WRITE_TOKEN=...   # production uploads only
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Getting started

```bash
npm install
npm run db:migrate
npm run db:seed        # set SEED_ADMIN_PASSWORD first
npm run dev            # http://localhost:3100
```

Sign in at `/admin`. Change the seeded password after the first login.

---

## Before deploying

1. **Hosted MySQL** — Vercel cannot reach `localhost:3306`. PlanetScale, Railway or Aiven.
2. **Vercel Blob store** — otherwise uploads fail in production.
3. Set `JWT_SECRET`, `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` in Vercel.
4. Run `npm run db:deploy` against the hosted database.
5. Decide the domain (e.g. `choir.stpaulschapelnbi.org`).

---

## Still to do

- Admin CRUD for Mass plans, Repertoire, Concerts, Gallery, Members, Users — the routes are in the sidebar but the pages are not built yet.
- Review each song's copyright status and clear the `UNKNOWN` backlog.
- Bulk gallery upload for the choir's photo archive.
- Wording polish across the public pages.
