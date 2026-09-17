# Production image for @lieferradar/api — runs migrations on boot, then serves.
# Build from the REPO ROOT:  docker build -f apps/api/Dockerfile .
FROM node:20-alpine AS base
# openssl: prisma engine needs it at runtime on musl
RUN apk add --no-cache openssl && corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @lieferradar/shared --filter @lieferradar/api

FROM deps AS build
COPY package.json ./
COPY prisma prisma
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm db:generate \
  && pnpm --filter @lieferradar/shared build \
  && pnpm --filter @lieferradar/api build

# Runner keeps devDeps (prisma CLI for migrate deploy) — correctness over image size on a single VPS.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
RUN chown -R node:node /app
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s \
  CMD wget -qO- http://127.0.0.1:${PORT:-3001}/healthz || exit 1
CMD ["sh", "-c", "npx prisma migrate deploy && node apps/api/dist/server.js"]
