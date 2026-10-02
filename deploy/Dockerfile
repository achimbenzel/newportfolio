# ─────────────────────────────────────────────────────────────────────────────
# Website-Container: baut die statische Seite und liefert sie mit nginx aus.
#   docker build -f deploy/Dockerfile -t achimbenzel-web .
# Build-Variablen (Sanity) per --build-arg oder .env im Build-Kontext (web/.env).
# ─────────────────────────────────────────────────────────────────────────────

# 1) Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY web/package.json web/
COPY studio/package.json studio/
RUN npm ci --workspace web --include-workspace-root
COPY web web
ARG VITE_SITE_URL=https://achimbenzel.com
ARG SANITY_PROJECT_ID=
ARG SANITY_DATASET=production
ARG SANITY_API_VERSION=2026-10-01
ENV VITE_SITE_URL=$VITE_SITE_URL \
    SANITY_PROJECT_ID=$SANITY_PROJECT_ID \
    SANITY_DATASET=$SANITY_DATASET \
    SANITY_API_VERSION=$SANITY_API_VERSION
RUN npm run build -w web

# 2) Auslieferung
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/build/client /usr/share/nginx/html
EXPOSE 80
