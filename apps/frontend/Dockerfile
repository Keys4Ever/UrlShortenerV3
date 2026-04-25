# syntax=docker/dockerfile:1
# Build context: raíz del monorepo (pnpm).
# Caché por capas: lock + fetch | manifests + install offline | solo código + build.
# Montaje BuildKit: reutiliza el store de pnpm entre builds aunque cambien capas inferiores.
FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm fetch

COPY package.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline --filter "./apps/frontend"

COPY apps/frontend ./apps/frontend
COPY changelog.md ./changelog.md

WORKDIR /app/apps/frontend
ENV CI=true
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm run build

FROM nginx:alpine
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
