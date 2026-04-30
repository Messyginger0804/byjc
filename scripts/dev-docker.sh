#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Starting PostgreSQL container..."
docker compose up db -d --wait

echo "PostgreSQL is ready. Starting Next.js dev server..."
exec npm run dev