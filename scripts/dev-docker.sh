#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Starting PostgreSQL container..."
docker compose up db -d --wait

echo "Applying canonical database migrations..."
DATABASE_URL=postgresql://byjc:byjc_dev@localhost:5432/byjc npm run db:migrate

echo "PostgreSQL is ready. Starting Next.js dev server..."
exec npm run dev
