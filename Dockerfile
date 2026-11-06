# Stage 1: Install production dependencies
FROM node:22.23.4-alpine3.23 AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts

# Stage 2: Install all dependencies and build
FROM node:22.23.4-alpine3.23 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# The postbuild sitemap step needs the production environment and canonical URL.
ARG NEXT_PUBLIC_PROD_URL=https://www.byjc.dev
ENV NODE_ENV=production
ENV NEXT_PUBLIC_PROD_URL=$NEXT_PUBLIC_PROD_URL
RUN npm run build

# Dev stage (docker-compose only): lockfile deps; source is bind-mounted at runtime.
# Not on the production path; the final stage below remains the default build target.
FROM node:22.23.4-alpine3.23 AS dev
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci --ignore-scripts && mkdir -p .next
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Production runner
FROM node:22.23.4-alpine3.23 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
