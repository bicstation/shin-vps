# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile
# 🚀 v5.0 FINAL STABLE MONOREPO EDITION
# =====================================================================

# ---------------------------------------------------------------------
# Stage 1: Builder
# ---------------------------------------------------------------------
FROM node:20-slim AS builder

# ---------------------------------------------------------------------
# Build Arguments
# ---------------------------------------------------------------------
ARG PROJECT_NAME
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_PATH
ARG INTERNAL_API_URL

# ---------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL

WORKDIR /app

# ---------------------------------------------------------------------
# 1. Minimal OS Packages
# ---------------------------------------------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# 2. Project Package Files
# monorepo root context 前提
# ---------------------------------------------------------------------
COPY ${PROJECT_NAME}/package*.json ./
COPY ${PROJECT_NAME}/tsconfig*.json ./

# ---------------------------------------------------------------------
# 3. Install Dependencies
# ---------------------------------------------------------------------
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm install --legacy-peer-deps --no-audit --progress=false

# ---------------------------------------------------------------------
# 4. Shared Semantic Layer
# SHIN CORE LINX shared infrastructure
# ---------------------------------------------------------------------
COPY shared/ ./shared/

# ---------------------------------------------------------------------
# 5. Project Source
# IMPORTANT:
# root context build architecture
# ---------------------------------------------------------------------
COPY ${PROJECT_NAME}/ ./

# ---------------------------------------------------------------------
# 6. Runtime Environment
# ---------------------------------------------------------------------
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NODE_ENV=production \
    NEXT_PRIVATE_STANDALONE=true

# ---------------------------------------------------------------------
# 7. Cleanup Old Cache
# ---------------------------------------------------------------------
RUN rm -rf .next .cache

# ---------------------------------------------------------------------
# 8. Next.js Build
# ---------------------------------------------------------------------
RUN chmod +x ./node_modules/.bin/next && \
    ./node_modules/.bin/next build

# ---------------------------------------------------------------------
# Stage 2: Runner
# ---------------------------------------------------------------------
FROM node:20-slim AS runner

WORKDIR /app

# ---------------------------------------------------------------------
# Runtime Arguments
# ---------------------------------------------------------------------
ARG PROJECT_NAME

# ---------------------------------------------------------------------
# Runtime Environment
# ---------------------------------------------------------------------
ENV NODE_ENV=production \
    HOSTNAME="0.0.0.0" \
    PORT=3000

# ---------------------------------------------------------------------
# 1. nextjs User
# ---------------------------------------------------------------------
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ---------------------------------------------------------------------
# 2. Runtime Assets
# ---------------------------------------------------------------------
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/public ./public

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/standalone ./

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/static ./.next/static

# ---------------------------------------------------------------------
# 3. Cleanup
# ---------------------------------------------------------------------
RUN rm -rf node_modules/.cache

# ---------------------------------------------------------------------
# 4. Runtime User
# ---------------------------------------------------------------------
USER nextjs

# ---------------------------------------------------------------------
# 5. Port
# ---------------------------------------------------------------------
EXPOSE 3000

# ---------------------------------------------------------------------
# 6. Start
# ---------------------------------------------------------------------
CMD ["node", "server.js"]