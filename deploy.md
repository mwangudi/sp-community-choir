# Deploying the Community Choir site

Co-hosted on the existing DigitalOcean droplet (`ubuntu-s-2vcpu-4gb-lon1`,
IP `46.101.6.131`, Ubuntu 24.04, 2 vCPU / 4 GB). One IP serves many sites —
nginx routes by domain — so **no new droplet is needed**.

- **App URL:** `https://hispraises.org` (written `CHOIR_DOMAIN` in the setup steps below)
- **Stack:** Next.js 15 (SSR) + Prisma + MySQL 8, behind nginx with Let's Encrypt
- **App path:** `/var/www/choir`
- **Uploads path:** `/var/lib/choir-uploads` (outside the git tree)
- **Port:** `3100` (localhost only, proxied by nginx)
- **How it runs:** a prebuilt Next.js standalone bundle — `node server.js`, no
  build on the server. To ship a change, see [10. Redeploying](#10-redeploying).

> **Important difference from PharmaCare.** PharmaCare is a static SPA plus a
> separate API, so nginx serves a `dist/` folder. This app renders every page on
> the server, so nginx proxies **all** traffic to a Node process. Don't copy the
> PharmaCare vhost.

> Billing note: DigitalOcean bills per **account**. A late invoice suspends every
> droplet on it, so this site shares billing fate with PharmaCare and cedarcapital.

---

## 0. Prerequisites

Most are already on the droplet from the other sites. Verify:

```bash
node -v                 # need v20+
nginx -v
mysql --version
sudo ufw status         # OpenSSH + Nginx Full allowed; do NOT open 3100
```

**Check swap before anything else.** `next build` peaks around 1.5 GB and this
box already runs MySQL plus two Node services. Without swap the build can be
OOM-killed:

```bash
free -m
# If there is no swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Chromium, for the worship aid PDF.** The Download PDF button prints the aid
with a headless browser. Without one the page still works and Print still
offers Save as PDF, but the button returns an error:

```bash
sudo apt install -y chromium-browser   # or: sudo apt install -y chromium
which chromium chromium-browser        # found automatically at either path
```

Set `CHROME_PATH` in `.env` only if it is installed somewhere else.

---

## 1. DNS

Add an A record for the chosen subdomain, then wait for it to resolve:

| Type | Host | TTL | Value |
|------|------|-----|-------|
| A | `CHOIR_DOMAIN` | 300 | `46.101.6.131` |

```bash
dig +short CHOIR_DOMAIN   # must return 46.101.6.131
```

---

## 2. Get the code

The repo is `git@github.com:mwangudi/sp-community-choir.git`. The local clone
uses the SSH host alias `github-mwangudi`, which does not exist on the server —
add a deploy key for the droplet in the GitHub repo settings and use the plain
host, or clone over HTTPS.

```bash
sudo mkdir -p /var/www/choir
sudo chown -R "$USER":"$USER" /var/www/choir
git clone git@github.com:mwangudi/sp-community-choir.git /var/www/choir
cd /var/www/choir && git checkout main
```

---

## 3. MySQL — database + dedicated user

A separate database from PharmaCare's.

```bash
sudo mysql
```
```sql
CREATE DATABASE stpauls_choir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'choir'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON stpauls_choir.* TO 'choir'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Uploads directory

Hero images, login slides and blog covers are written to disk. Keep them
**outside** the repo so a redeploy or `git clean` can never wipe them.

```bash
sudo mkdir -p /var/lib/choir-uploads
sudo chown -R www-data:www-data /var/lib/choir-uploads
sudo ln -sfn /var/lib/choir-uploads /var/www/choir/public/uploads
```

Leave `BLOB_READ_WRITE_TOKEN` unset — that switch only exists for Vercel.

---

## 5. Configure

```bash
cd /var/www/choir
cp .env.example .env
nano .env
```

Set at minimum:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `mysql://choir:<PASSWORD>@localhost:3306/stpauls_choir` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://CHOIR_DOMAIN` |
| `SEED_ADMIN_EMAIL` | the choir's admin address |
| `SEED_ADMIN_PASSWORD` | a strong one-time password |

> `NEXT_PUBLIC_*` values are baked in at **build time**. If you change them you
> must rebuild, not just restart.

---

## 6. Migrate, seed, build

```bash
cd /var/www/choir
npm ci --no-audit --no-fund
npx prisma migrate deploy
npm run db:seed                 # creates the first admin user
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

Optionally import the bundled photo archive into the gallery:

```bash
node scripts/import-gallery.mjs        # add --publish to make them live at once
```

---

## 7. Run as a service

```bash
sudo chown -R www-data:www-data /var/www/choir
sudo cp /var/www/choir/deploy/systemd/stpauls-choir.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now stpauls-choir
sudo systemctl status stpauls-choir
curl -I http://127.0.0.1:3100/          # expect 200
```

---

## 8. nginx vhost

```bash
sudo cp /var/www/choir/deploy/nginx/stpauls-choir.conf /etc/nginx/sites-available/
sudo sed -i 's/CHOIR_DOMAIN/your.actual.domain/' /etc/nginx/sites-available/stpauls-choir.conf
sudo ln -s /etc/nginx/sites-available/stpauls-choir.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. HTTPS

```bash
sudo certbot --nginx -d CHOIR_DOMAIN
```

Certbot adds the 443 server block, the HTTP→HTTPS redirect and a renewal timer.

---

## 10. Redeploying

The live service runs a **standalone bundle built on your own machine** and
uploaded — the droplet never runs `npm` or `next build` (see the comment in
`deploy/systemd/stpauls-choir.service`). From a clean, committed checkout:

```bash
SSH_KEY=~/.ssh/id_ed255_new bash deploy/deploy-bundle.sh
```

[`deploy/deploy-bundle.sh`](deploy/deploy-bundle.sh) then:

1. builds with the live site's public settings (`SITE_URL`, default
   `https://hispraises.org` — `NEXT_PUBLIC_*` values are baked in at build time,
   so a build with the local `.env` would point links at the wrong domain);
2. assembles the bundle and strips macOS/Windows binaries and every `.env`;
3. backs up the database to `/root/choir-backups/choir-<time>.sql.gz`;
4. uploads to `/var/www/choir-next`, adds the server's `.env`, its Linux `sharp`
   binaries and the `public/uploads` link;
5. runs `prisma migrate deploy`, swaps the release in, restarts
   `stpauls-choir` and checks `/`, `/masses` and `/admin/login` return 200;
6. keeps the previous release as `/var/www/choir-prev-<time>` (the newest two
   are kept; set `KEEP` to change that).

**SSH access.** Log in as `root` with a key listed in
`/root/.ssh/authorized_keys`. Keys added under DigitalOcean → Settings →
Security only reach droplets created *after* they were added; for this droplet,
open **Access → Launch Droplet Console** and append the public key (one line,
starting `ssh-ed25519`) to that file.

**Rollback.**

```bash
sudo systemctl stop stpauls-choir
sudo mv /var/www/choir /var/www/choir-broken
sudo mv /var/www/choir-prev-<time> /var/www/choir
sudo systemctl start stpauls-choir
```

Migrations are not undone by this. If one must be, restore the backup taken by
that deploy: `zcat /root/choir-backups/choir-<time>.sql.gz | mysql -u choir -p stpauls_choir`.

**Data repairs.** Scripts in `scripts/` ship with every bundle and run against
the live database from `/var/www/choir`:

```bash
cd /var/www/choir && set -a && . ./.env && set +a
node scripts/rebuild-mass-settings.mjs --dry-run   # then without --dry-run
```

> `deploy/deploy.sh` is the older pull-and-build-on-server route. It does not
> match how the service is now set up; use `deploy-bundle.sh`.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 502 from nginx | `sudo systemctl status stpauls-choir`, then `curl -I http://127.0.0.1:3100/` |
| Service won't start | `sudo journalctl -u stpauls-choir -n 80 --no-pager` |
| Build killed | Out of memory — confirm swap is on with `free -m` |
| Admin edits don't show | Every public page is `force-dynamic`; if one is stale it is missing that export |
| Uploads 404 | Check the `public/uploads` symlink and that nginx `alias` points at `/var/lib/choir-uploads/` |
| Images unoptimised / erroring | `sharp` must be installed — it is a dependency, so re-run `npm ci` |
| Login redirect loop | `JWT_SECRET` missing or under 32 chars |

## Backups

`deploy/deploy-bundle.sh` dumps the database to `/root/choir-backups/` before
every deploy. Nothing runs on a schedule yet; uploads are not covered by it.
By hand:

```bash
mysqldump -u choir -p stpauls_choir > ~/choir-$(date +%F).sql
tar czf ~/choir-uploads-$(date +%F).tar.gz /var/lib/choir-uploads
```
