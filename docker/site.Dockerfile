# Static site image: Lieferuhr Einkauf at /, FrachtRadar at /fleet/, /api proxied to the api service.
# Build from the REPO ROOT:  docker build -f docker/site.Dockerfile .
FROM node:20-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
COPY apps/fleet/package.json apps/fleet/
RUN pnpm install --frozen-lockfile \
  --filter @lieferradar/shared --filter @lieferradar/web --filter @lieferradar/fleet

COPY packages/shared packages/shared
COPY apps/web apps/web
COPY apps/fleet apps/fleet
# Production build: same-origin API at /api (nginx proxies to the api service), no demo mode.
ENV VITE_API_URL=/api
RUN pnpm --filter @lieferradar/shared build \
  && pnpm --filter @lieferradar/web build \
  && pnpm --filter @lieferradar/fleet build

FROM nginx:1.27-alpine AS runner
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY --from=build /app/apps/fleet/dist /usr/share/nginx/html/fleet
EXPOSE 80
