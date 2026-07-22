# Deploying PharmaCare (co-hosted on the existing droplet)

This guide adds PharmaCare **alongside** the sites already on your droplet
(`ubuntu-s-2vcpu-4gb-lon1`, IP `46.101.6.131`). One IP serves many sites — Nginx
routes by domain name — so **no new droplet is needed**.

- **App URL:** `https://pharma.localinvestors.co.ke`
- **Stack:** React (Vite build, static) + Node/Fastify API + Prisma + MySQL 8, behind Nginx with Let's Encrypt.
- **App path on server:** `/var/www/pharma`
- **API port:** `4000` (localhost only, proxied by Nginx)

> Billing note: DigitalOcean bills per **account**. A late/unpaid invoice suspends the
> whole account (every droplet), so co-hosting here shares billing fate with your other
> sites. True isolation between clients requires a **separate DO account**, not a separate droplet.

---

## 0. Prerequisites on the droplet
Most are already present from your existing site. Verify/install what's missing:

```bash
# Node 20 LTS (check first)
node -v   # need v20+
# If missing:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx, MySQL, Certbot (likely already installed)
sudo apt-get install -y nginx mysql-server
sudo apt-get install -y certbot python3-certbot-nginx git
```

Firewall: only 22/80/443 should be open. Port 4000 stays internal.
```bash
sudo ufw status   # ensure 'OpenSSH' + 'Nginx Full' allowed; do NOT open 4000
```

---

## 1. DNS
Point the subdomain at the droplet (same as you did for cedarcapital). This is
already done:

| Type | Host | TTL | Value |
|------|------|-----|-------|
| A | `pharma` (→ pharma.localinvestors.co.ke) | 300 | `46.101.6.131` |

Wait for it to resolve: `dig +short pharma.localinvestors.co.ke` → `46.101.6.131`.

**Optional — `www` subdomain.** If you also want `www.pharma.localinvestors.co.ke` to
work, add a matching record so Nginx on this droplet receives its traffic and can
redirect it (see §8 → Redirects):

| Type | Host | Value |
|------|------|-------|
| A | `www.pharma` | `46.101.6.131` |

> Note: the current `www.pharma` record points to `102.130.123.40` (the default web
> host), so `www.pharma` won't reach PharmaCare until you repoint it here.

---

## 2. Get the code
```bash
sudo mkdir -p /var/www/pharma
sudo chown -R "$USER":"$USER" /var/www/pharma
git clone git@github.com:mwangudi/pharma.git /var/www/pharma
cd /var/www/pharma
git checkout develop
```

---

## 3. MySQL — database + dedicated user
```bash
sudo mysql
```
```sql
CREATE DATABASE pharmacare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pharmacare'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON pharmacare.* TO 'pharmacare'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
This is a **separate database** from your other sites' data.

---

## 4. Backend — configure, migrate, seed, build
```bash
cd /var/www/pharma/backend
cp .env.production.example .env
# Edit .env:
#   - DATABASE_URL: use the pharmacare user + password from step 3
#   - JWT_SECRET:   openssl rand -hex 32
nano .env

npm ci
npx prisma generate
npx prisma migrate deploy     # creates all tables from committed migrations
npm run seed                  # loads admin login + demo financials (idempotent)
npm run build                 # compiles to dist/
```
Seeded admin login: `admin@pharmacare.co.ke` / `admin123` — **change the password after first login.**

---

## 5. Frontend — build the static site
```bash
cd /var/www/pharma/frontend
npm ci
npm run build                 # outputs to dist/ (served by Nginx)
```
The SPA calls the API at the relative path `/api`, which Nginx proxies to the backend — no frontend env needed.

---

## 6. Run the API as a service
```bash
# The service runs as www-data — give it ownership of the app files:
sudo chown -R www-data:www-data /var/www/pharma

sudo cp /var/www/pharma/deploy/systemd/pharmacare-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now pharmacare-api
sudo systemctl status pharmacare-api        # should be active (running)
curl -s http://127.0.0.1:4000/health        # {"ok":true,...}
```

---

## 7. Nginx vhost
```bash
sudo cp /var/www/pharma/deploy/nginx/pharma.localinvestors.co.ke.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/pharma.localinvestors.co.ke.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
Your existing sites are untouched — this only adds the `pharma.localinvestors.co.ke` server block.

---

## 8. HTTPS (Let's Encrypt)
```bash
sudo certbot --nginx -d pharma.localinvestors.co.ke
```
Certbot adds the 443 block + HTTP→HTTPS redirect and auto-renews. Verify:
`https://pharma.localinvestors.co.ke` → login page.

### Redirects (how Nginx routes and redirects)
Nginx picks the site by the request's `Host` header, so redirects are just extra
server blocks:

- **HTTP → HTTPS (automatic).** Certbot's port-80 block 301-redirects all plain HTTP
  to HTTPS. Nothing else to configure.
- **www → canonical host.** The shipped vhost already includes a block that redirects
  `www.pharma.localinvestors.co.ke` → `https://pharma.localinvestors.co.ke`. To use it:
  1. Point the `www.pharma` A record at `46.101.6.131` (see §1).
  2. Include www when you run Certbot so it also gets a valid certificate:
     ```bash
     sudo certbot --nginx -d pharma.localinvestors.co.ke -d www.pharma.localinvestors.co.ke
     ```
  3. `sudo systemctl reload nginx`.
- **Raw IP / unknown host.** Opening `http://46.101.6.131` directly shows whichever
  vhost is Nginx's `default_server` (your existing site) — there is no domain to match,
  so it never reaches PharmaCare. That is expected; the app is served only via
  `pharma.localinvestors.co.ke`.

---

## 9. Redeploys (after the first setup)
Pull + build + migrate + restart in one step:
```bash
sudo bash /var/www/pharma/deploy/deploy.sh
```
(Re-running `npm run seed` is safe — the seed is guarded and won't duplicate data.)

---

## Troubleshooting
- **API won't start:** `journalctl -u pharmacare-api -n 50 --no-pager` (usually a bad `DATABASE_URL` or missing `.env`).
- **502 from Nginx:** the API isn't running on 4000 — check the service status.
- **Prisma migrate error:** confirm the MySQL user/password and that the `pharmacare` DB exists.
- **Blank page / 404 on refresh:** ensure the vhost `try_files ... /index.html;` block is in place and `dist/` was built.
- **Reset demo data (test only):** `cd backend && npx prisma migrate reset --force` (drops → re-migrates → re-seeds).
