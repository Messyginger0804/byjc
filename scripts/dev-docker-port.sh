#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Starting PostgreSQL and Next.js in Docker..."
docker compose -f docker-compose.yml up db -d --wait

echo "Starting app container on port 3002..."
docker compose -f docker-compose.yml up app