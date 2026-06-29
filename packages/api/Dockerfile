# ----- @adu-dashboard/api production image -----
#
# Multi-stage to keep the prod image small. Alpine base because the
# Hetzner VPS is at 85% disk; every MB counts. wget is preinstalled
# in alpine so the HEALTHCHECK doesn't need extra packages.
#
# Build context is the repo root (see docker-compose.yml `build:`),
# so all COPY paths are repo-relative.

# Build stage: install all deps (including tsx) for compile + runtime.
FROM node:20-alpine AS build
WORKDIR /app

COPY packages/api/package.json ./
RUN npm install --no-audit --no-fund

COPY packages/api/ ./

# Runtime stage: copy the installed tree as-is. tsx interprets TS
# at startup — for a small handler workload this avoids a separate
# tsc compile step in CI and keeps src and prod identical.
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8081

COPY --from=build /app /app

EXPOSE 8081

# 127.0.0.1 not localhost: Hono binds 0.0.0.0 (IPv4 only). Alpine
# busybox wget resolves `localhost` to ::1 (IPv6) first and gets
# Connection refused since the server isn't on v6 — Docker marks the
# container unhealthy even though it's serving fine. Same trap that
# bit the Vite proxy on Windows (#69).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8081/health || exit 1

CMD ["npx", "tsx", "src/index.ts"]
