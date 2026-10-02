# Deploying the Community Choir site

Co-hosted on the existing DigitalOcean droplet (`ubuntu-s-2vcpu-4gb-lon1`,
IP `46.101.6.131`, Ubuntu 24.04, 2 vCPU / 4 GB). One IP serves many sites —
nginx routes by domain — so **no new droplet is needed**.

- **App URL:** `https://CHOIR_DOMAIN` — *not decided yet; replace everywhere below*
- **Stack:** Next.js 15 (SSR) + Prisma + MySQL 8, behind nginx with Let's Encrypt
- **App path:** `/var/www/choir`
- **Uploads path:** `/var/lib/choir-uploads` (outside the git tree)
- **Port:** `3100` (localhost only, proxied by nginx)

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

After the first setup, everything above collapses into:

```bash
sudo bash /var/www/choir/deploy/deploy.sh
```

It pulls `main`, installs, migrates, rebuilds with a capped heap, restarts the
service and reloads nginx.

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

Not yet automated. At minimum, before each deploy:

```bash
mysqldump -u choir -p stpauls_choir > ~/choir-$(date +%F).sql
tar czf ~/choir-uploads-$(date +%F).tar.gz /var/lib/choir-uploads
```
