#!/usr/bin/env bash
# Build the site here and ship it to the droplet as a standalone bundle.
#
#   SSH_KEY=~/.ssh/id_ed255_new bash deploy/deploy-bundle.sh
#
# The droplet runs `node server.js` from /var/www/choir and has no build step
# (see deploy/systemd/stpauls-choir.service), so the build happens on this
# machine. Steps, all of which stop the run on failure:
#
#   1. Build with the live site's public settings (baked in at build time).
#   2. Assemble .next/standalone, static assets, public/, prisma/ and scripts/,
#      swap in Linux sharp binaries matching the bundled sharp, and drop every
#      .env file.
#   3. Back up the live database, upload to /var/www/choir-next, give it the
#      server's .env and uploads link, and check the bundled Linux sharp loads.
#   4. Apply migrations, swap the release in, keep the old one as
#      /var/www/choir-prev-<time> for rollback, restart and smoke-test.
#
# Rollback: stop the service, move /var/www/choir aside, move the newest
# choir-prev-* back to /var/www/choir, start the service. Migrations are not
# rolled back; restore the backup in /root/choir-backups if one must be.
set -euo pipefail

HOST="${DEPLOY_HOST:-root@46.101.6.131}"
SITE_URL="${SITE_URL:-https://hispraises.org}"
ALLOW_INDEXING="${ALLOW_INDEXING:-true}"
PRISMA_VERSION="${PRISMA_VERSION:-6.19.3}"
# Old releases kept on the server besides the live one (the newest, for rollback).
KEEP="${KEEP:-1}"

SSH_OPTS=(-o BatchMode=yes)
if [[ -n "${SSH_KEY:-}" ]]; then
  SSH_OPTS+=(-i "$SSH_KEY" -o IdentitiesOnly=yes)
fi

cd "$(dirname "$0")/.."
STAGE="$(mktemp -d)/bundle"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "!! Uncommitted changes — commit them first so the live site matches main." >&2
  exit 1
fi

echo "==> Building $(git rev-parse --short HEAD) for $SITE_URL"
rm -rf .next
NEXT_PUBLIC_SITE_URL="$SITE_URL" NEXT_PUBLIC_ALLOW_INDEXING="$ALLOW_INDEXING" npx next build

echo "==> Assembling bundle"
mkdir -p "$STAGE/.next/static" "$STAGE/prisma"
cp -R .next/standalone/. "$STAGE/"
cp -R .next/static/. "$STAGE/.next/static/"
rm -rf "$STAGE/public" && cp -R public "$STAGE/public" && rm -rf "$STAGE/public/uploads"
cp prisma/schema.prisma prisma/seed.ts "$STAGE/prisma/"
cp -R prisma/migrations prisma/data "$STAGE/prisma/"
cp -R scripts "$STAGE/scripts"
# Swap this machine's sharp binaries for the Linux ones, at exactly the
# versions this sharp was built against. Reusing whatever the server had once
# left a libvips one release too new, so sharp never loaded there.
rm -rf "$STAGE"/node_modules/@img/sharp-*
SHARP_PKGS=$(node -p '
  const o = require("./node_modules/sharp/package.json").optionalDependencies;
  ["@img/sharp-linux-x64", "@img/sharp-libvips-linux-x64"].map((n) => `${n}@${o[n]}`).join(" ")')
PACKS="$(mktemp -d)"
for pkg in $SHARP_PKGS; do
  tarball=$(cd "$PACKS" && npm pack --silent "$pkg")
  dest="$STAGE/node_modules/${pkg%@*}"
  mkdir -p "$dest"
  tar -xzf "$PACKS/$tarball" -C "$dest" --strip-components=1
  echo "    $pkg"
done
rm -rf "$PACKS"
find "$STAGE/node_modules/.prisma/client" -name "*darwin*" -delete -o -name "*windows*" -delete
# Next traces the local .env into standalone; shipping it would overwrite the
# server's credentials with development ones.
find "$STAGE" -name ".env*" -not -path "*/node_modules/*" -delete
grep -q "${SITE_URL#https://}" "$STAGE/.next/server/app/robots.txt.body" \
  || { echo "!! Bundle was not built for $SITE_URL" >&2; exit 1; }
echo "    $(du -sh "$STAGE" | cut -f1)"

echo "==> Uploading to $HOST"
rsync -az --delete -e "ssh ${SSH_OPTS[*]}" "$STAGE/" "$HOST:/var/www/choir-next/"

echo "==> Backing up, migrating and switching over"
ssh "${SSH_OPTS[@]}" "$HOST" PRISMA_VERSION="$PRISMA_VERSION" KEEP="$KEEP" bash -s <<'REMOTE'
set -euo pipefail
N=/var/www/choir-next
O=/var/www/choir
TS=$(date +%Y%m%d-%H%M)

cd "$O"
set -a; . ./.env; set +a
eval "$(node -e '
  const u = new URL(process.env.DATABASE_URL);
  const q = (s) => JSON.stringify(decodeURIComponent(s));
  console.log(`DB_USER=${q(u.username)} DB_PASS=${q(u.password)} DB_HOST=${u.hostname} DB_PORT=${u.port || 3306} DB_NAME=${u.pathname.slice(1)}`);
')"
mkdir -p /root/choir-backups
BACKUP=/root/choir-backups/choir-$TS.sql.gz
MYSQL_PWD="$DB_PASS" mysqldump --no-tablespaces --single-transaction \
  -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" | gzip > "$BACKUP"
echo "    database backed up to $BACKUP"

cp -p "$O"/.env* "$N"/
ln -sfn /var/lib/choir-uploads "$N"/public/uploads
chown -R www-data:www-data "$N"

cd "$N"
# Image uploads and the optimiser need it; fail here rather than in front of users.
node -e 'require("sharp")' && echo "    sharp loads"
npx -y "prisma@$PRISMA_VERSION" migrate deploy

mv "$O" "/var/www/choir-prev-$TS"
mv "$N" "$O"
systemctl restart stpauls-choir
sleep 6
systemctl is-active stpauls-choir
for path in / /masses /admin/login; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3100$path")
  echo "    $code $path"
  [[ "$code" == 200 ]] || { echo "!! $path returned $code — roll back with the steps at the top of deploy/deploy-bundle.sh" >&2; exit 1; }
done

# Keep the newest few releases for rollback.
ls -d /var/www/choir-prev-* 2>/dev/null | sort | head -n -"$KEEP" | xargs -r rm -rf
echo "    kept: $(ls -d /var/www/choir-prev-* 2>/dev/null | tr '\n' ' ')"
REMOTE

rm -rf "$(dirname "$STAGE")"
echo "==> Live: $SITE_URL"
