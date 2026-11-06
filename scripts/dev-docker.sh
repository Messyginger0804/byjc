#!/bin/bash
# Runs the whole dev stack (PostgreSQL + Next.js) in Docker. Migrations run inside the app container.
# Override host ports with APP_PORT (default 3002) and DB_PORT (default 5432).
set -e

cd "$(dirname "$0")/.."

# Refresh only the anonymous node_modules volume so lockfile changes are picked up.
# (-V would also recreate .next and drop the dev compiler cache.)
app_container="$(docker compose ps -aq app 2>/dev/null || true)"
if [ -n "$app_container" ]; then
    modules_volume="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/app/node_modules"}}{{.Name}}{{end}}{{end}}' "$app_container")"
    docker compose rm -fs app >/dev/null
    [ -n "$modules_volume" ] && docker volume rm "$modules_volume" >/dev/null || true
fi
exec docker compose up --build app
