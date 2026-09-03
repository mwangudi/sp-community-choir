#!/usr/bin/env bash
# Redeploy the choir site after the initial setup in deploy.md.
#   sudo bash /var/www/choir/deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/choir}"
BRANCH="${BRANCH:-main}"
SERVICE="${SERVICE:-stpauls-choir}"

cd "$APP_DIR"

echo "==> Pulling $BRANCH"
git fetch --all --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Installing dependencies"
npm ci --no-audit --no-fund

echo "==> Applying database migrations"
npx prisma migrate deploy

# next build needs well over 1 GB; this droplet is shared, so cap the heap
# rather than let it race MySQL for memory.
echo "==> Building"
NODE_OPTIONS="--max-old-space-size=1536" npm run build

echo "==> Restarting $SERVICE"
chown -R www-data:www-data "$APP_DIR/.next"
systemctl restart "$SERVICE"

echo "==> Reloading nginx"
nginx -t && systemctl reload nginx

sleep 3
systemctl --no-pager status "$SERVICE" | head -n 15
curl -fsS -o /dev/null -w "local HTTP %{http_code}\n" http://127.0.0.1:3100/
