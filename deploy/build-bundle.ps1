$ErrorActionPreference = "Stop"
$stage = ".deploy-bundle"

Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $stage | Out-Null

# Next's standalone output leaves static assets and public/ for us to place.
Copy-Item ".next/standalone/*" $stage -Recurse -Force
New-Item -ItemType Directory -Path "$stage/.next/static" -Force | Out-Null
Copy-Item ".next/static/*" "$stage/.next/static" -Recurse -Force
Copy-Item "public" "$stage/public" -Recurse -Force

# Migrations and the schema travel too, so the server can run prisma deploy.
New-Item -ItemType Directory -Path "$stage/prisma" -Force | Out-Null
Copy-Item "prisma/schema.prisma" "$stage/prisma/" -Force
Copy-Item "prisma/migrations" "$stage/prisma/migrations" -Recurse -Force
Copy-Item "prisma/data" "$stage/prisma/data" -Recurse -Force
Copy-Item "prisma/seed.ts" "$stage/prisma/" -Force
Copy-Item "scripts" "$stage/scripts" -Recurse -Force

# The Windows binaries would only confuse the server.
Remove-Item "$stage/node_modules/@img/sharp-win32-x64" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$stage/node_modules/@img/sharp-libvips-win32-x64" -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem "$stage/node_modules/.prisma/client" -Filter "*windows*" -ErrorAction SilentlyContinue |
  Remove-Item -Force -ErrorAction SilentlyContinue

# Next traces the local .env into standalone. Shipping it would overwrite the
# server's generated credentials with development ones.
Get-ChildItem $stage -Filter ".env*" -Force -Recurse -ErrorAction SilentlyContinue |
  Remove-Item -Force

Write-Host "`n--- bundle contents ---"
$size = (Get-ChildItem $stage -Recurse -File | Measure-Object Length -Sum).Sum
"{0} MB total" -f [math]::Round($size / 1MB, 1)
"server.js present: $(Test-Path "$stage/server.js")"
"linux sharp: $(Test-Path "$stage/node_modules/@img/sharp-linux-x64")"
"env files shipped: $((Get-ChildItem $stage -Filter '.env*' -Force -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count)"
Get-ChildItem "$stage/node_modules/.prisma/client" -Filter "*.node" -ErrorAction SilentlyContinue |
  ForEach-Object { "prisma engine: $($_.Name)" }
