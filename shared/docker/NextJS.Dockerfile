# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile
# 🚀 FINAL STABLE MONOREPO EDITION
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
    libstdc++6 \
    fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# 2. Package Files
# monorepo root context architecture
# ---------------------------------------------------------------------
COPY ${PROJECT_NAME}/package.json ./
COPY ${PROJECT_NAME}/package-lock.json ./

# optional tsconfig
COPY ${PROJECT_NAME}/tsconfig.json ./tsconfig.json

# ---------------------------------------------------------------------
# 3. Install Dependencies
# ---------------------------------------------------------------------
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm cache clean --force

RUN npm install \
    --legacy-peer-deps \
    --no-audit \
    --progress=false \
    --unsafe-perm=true

# ---------------------------------------------------------------------
# 4. Shared Semantic Layer
# ---------------------------------------------------------------------
COPY shared/ ./shared/

# ---------------------------------------------------------------------
# 5. Project Source
# IMPORTANT:
# docker-compose build.context: ./
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
# 7. Cleanup Cache
# ---------------------------------------------------------------------
RUN rm -rf .next .cache node_modules/.cache

# ---------------------------------------------------------------------
# 8. Next.js Build
# permission denied 回避版
# ---------------------------------------------------------------------
RUN node node_modules/next/dist/bin/next build

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
# Runtime Packages
# ---------------------------------------------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# nextjs User
# ---------------------------------------------------------------------
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ---------------------------------------------------------------------
# Runtime Assets
# standalone mode
# ---------------------------------------------------------------------
COPY --from=builder /app/public ./public

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/standalone ./

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/static ./.next/static

# ---------------------------------------------------------------------
# Flatten Standalone Directory
# ---------------------------------------------------------------------
RUN for dir in \
    next-avflash \
    next-tiper \
    next-bic-saving \
    next-bicstation; do \
      if [ -d "./$dir" ]; then \
        cp -r ./$dir/. . && rm -rf ./$dir; \
      fi; \
    done

# ---------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------
RUN rm -rf .next/cache

# ---------------------------------------------------------------------
# Runtime User
# ---------------------------------------------------------------------
USER nextjs

# ---------------------------------------------------------------------
# Port
# ---------------------------------------------------------------------
EXPOSE 3000

# ---------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------
CMD ["node", "server.js"]