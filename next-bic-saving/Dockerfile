# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-bic-saving 専用)
# =====================================================================

# ---------------------------------------------------------------------
# Stage 1: Builder
# ---------------------------------------------------------------------
FROM node:20-slim AS builder 

# Build Args
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ARG PROJECT_NAME=next-bic-saving

ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ---------------------------------------------------------------------
# OS Packages
# ---------------------------------------------------------------------
RUN sed -i 's|http://deb.debian.org/debian |http://ftp.jp.debian.org/debian |g' /etc/apt/sources.list || true
RUN echo "deb http://security.debian.org/debian-security bookworm-security main" > /etc/apt/sources.list.d/security.list
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# Shared Library Copy
# ---------------------------------------------------------------------
COPY shared/ ./shared/

# ---------------------------------------------------------------------
# Project Source Copy
# context: ./ 前提
# ---------------------------------------------------------------------
COPY next-bic-saving/ ./

# ---------------------------------------------------------------------
# Cleanup Cache
# ---------------------------------------------------------------------
RUN rm -rf .next .cache node_modules/.cache

# ---------------------------------------------------------------------
# NPM Install
# ---------------------------------------------------------------------
RUN npm cache clean --force
RUN npm install --include=optional --unsafe-perm=true

# ---------------------------------------------------------------------
# Next.js Build
# 権限回避版
# ---------------------------------------------------------------------
RUN node node_modules/next/dist/bin/next build

# ---------------------------------------------------------------------
# Stage 2: Runner
# ---------------------------------------------------------------------
FROM node:20-slim AS runner

WORKDIR /app

# ---------------------------------------------------------------------
# Runtime Packages
# ---------------------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# Runtime User
# ---------------------------------------------------------------------
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ---------------------------------------------------------------------
# Runtime Environment
# ---------------------------------------------------------------------
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# ---------------------------------------------------------------------
# Standalone Output Copy
# ---------------------------------------------------------------------
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ---------------------------------------------------------------------
# Flatten Standalone Directory
# ---------------------------------------------------------------------
RUN if [ -d "./next-bic-saving" ]; then cp -r ./next-bic-saving/. . && rm -rf ./next-bic-saving; fi

# ---------------------------------------------------------------------
# Runtime User & Port
# ---------------------------------------------------------------------
USER nextjs
EXPOSE 3000

# ---------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------
CMD ["node", "server.js"]