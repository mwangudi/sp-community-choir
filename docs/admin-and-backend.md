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
- **MassPlan** / **MassPlanItem** — an order of service, one row per part. `kind` is
  `SUNDAY` for the Sunday flow, or `WEDDING` / `REQUIEM` / `FEAST` / `OTHER` for a
  special Mass on any day. Several plans may share a date; only one *Sunday* plan
  per date is allowed, enforced in `mass-plans/actions.ts`. `year` (lectionary
  cycle) is optional; `venue` is for special Masses held away from the chapel.
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

**Navbar** — sticks to the top; once the page scrolls it floats as a blurred card.

**Sidebar**
- Grouped menus with submenus: Dashboard · Music · Content · People
- Active item uses a gradient pill with a soft shadow; the parent group carries that state while collapsed
- The group containing the current page opens automatically
- Collapsible to a 72px icon rail; the choice is remembered in `localStorage`
- On the rail, clicking a group opens a flyout of its children
- Below `lg` the drawer becomes a temporary overlay

**Pages**
- **Dashboard** — greeting banner, four colour-coded stat cards, next Sunday's plan
- **Mass plans** — Sunday orders of service, fed by accepted song proposals
- **Special Masses** — weddings, requiems, feasts and other one-off Masses on any day.
  The admin picks the songs directly (no proposals). "Use the … outline" fills a
  starter order of service per occasion (`OUTLINES` in `src/lib/mass-occasions.ts`).
  Three parts exist only here: Rite of Marriage, Signing of Register, Final
  Commendation. Special Masses never appear on the public site.
- **Worship aid** — `/admin/worship-aid/[id]`, for any plan. An A4 preview beside the
  plan's details and a *Lyrics check* listing songs that would print as a bare
  heading. Download PDF renders this same page in headless Chromium; print rules in
  `globals.css` strip everything but the sheet. Sunday files are named like
  `27th Sun OT Year A.pdf` (`src/lib/worship-aid.ts`).
- **Song proposals** — status filters, full order of service per submission, one-click review
- **Applications** — consent evidence and status changes, plus erase-record
- **Blog** — list, editor, publish/unpublish, delete
- **Login carousel** — upload, reorder, hide, delete

---

## Worship aid lyrics

The aid prints each song's stored lyrics. A Mass setting is **one** song holding
every movement, each under a bold heading paragraph named after the part —
`<p><strong>Kyrie</strong></p>`, `Gloria`, `Sanctus`, … — and the aid prints only
the section whose heading matches the part being sung (`lyricsForPart` in
`worship-aid/[id]/page.tsx`). Other bold lines (refrains, "Gloria — alternative
setting") do not start a section. If a setting has no section for a movement, the
heading prints alone rather than another movement's text.

So when editing a setting in the admin, keep one bold heading line per movement,
spelled as the part is named.

Repair scripts (each has `--dry-run`, and is safe to re-run):

| Script | What it fixes |
|--------|---------------|
| `scripts/rebuild-mass-settings.mjs` | Settings whose sections were headed "Another setting" or had lost movements (most Kyries). Rebuilds them from the part-tagged variants in `prisma/data/liturgical-songs.json`, taking the most common text per movement. Run again after `import-lyrics.mjs`. |
| `scripts/split-ee-bwana.mjs` | "Ee Bwana Vyote Mali Yako", which held two other Offertory songs. Splits them into their own records. |
| `scripts/fix-repeated-movements.mjs` | Songs with the same movement heading twice, of which only the first printed. |
| `scripts/split-sequence.mjs` | The Pentecost and Corpus Christi Sequences filed as one song. |

Run against the live database as described in `deploy.md` → *Data repairs*.

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

## Deploying

Live at <https://hispraises.org> on the DigitalOcean droplet, not Vercel. Ship
changes with `deploy/deploy-bundle.sh`; the full setup, rollback and data-repair
steps are in [`deploy.md`](../deploy.md).

---

## Still to do

- Psalms 24, 34, 40, 98, 100, 104, 119, 145 and "Ee Bwana Sistahili" hold several
  responses or versions in one record, so an aid prints all of them. Split them the
  way `split-ee-bwana.mjs` does.
- Some older plans filed as Sundays are special Masses ("Wedding Mass Program",
  "Graduation", "All Souls' Day", "Exaltation of the Holy Cross"); move them by
  setting `kind`.
- The social-share image (`src/app/opengraph-image.tsx`) still prints the old
  `vercel.app` address.
- Review each song's copyright status and clear the `UNKNOWN` backlog.
- Bulk gallery upload for the choir's photo archive.
- Wording polish across the public pages.
