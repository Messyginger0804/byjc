#!/bin/bash
# Runs the whole dev stack (PostgreSQL + Next.js) in Docker. Migrations run inside the app container.
# Override host ports with APP_PORT (default 3002) and DB_PORT (default 5432).
set -e

cd "$(dirname "$0")/.."

# -V renews the anonymous node_modules/.next volumes so lockfile changes are picked up.
exec docker compose up --build -V app
