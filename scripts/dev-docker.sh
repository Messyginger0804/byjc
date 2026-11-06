#!/bin/bash
# Runs the whole dev stack (PostgreSQL + Next.js) in Docker. Migrations run inside the app container.
# Override host ports with APP_PORT (default 3002) and DB_PORT (default 5432).
set -e

cd "$(dirname "$0")/.."

# Refresh only the anonymous node_modules volume so lockfile changes are picked up.
# .next lives in the named next_cache volume, which survives container recreation and keeps the
# dev compiler cache. (-V would recreate every anonymous volume.)
# Containers created before that change still carry an anonymous .next volume; remove it too
# (anonymous volume names are 64 hex characters) so it does not linger.
app_container="$(docker compose ps -aq app 2>/dev/null || true)"
if [ -n "$app_container" ]; then
    modules_volume="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/app/node_modules"}}{{.Name}}{{end}}{{end}}' "$app_container")"
    legacy_next_volume="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/app/.next"}}{{.Name}}{{end}}{{end}}' "$app_container")"
    docker compose rm -fs app >/dev/null
    [ -n "$modules_volume" ] && docker volume rm "$modules_volume" >/dev/null || true
    if printf '%s' "$legacy_next_volume" | grep -Eq '^[0-9a-f]{64}$'; then
        docker volume rm "$legacy_next_volume" >/dev/null || true
    fi
fi
exec docker compose up --build app
