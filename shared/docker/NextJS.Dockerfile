# =====================================================================
# 🚀 SHIN CORE LINX｜Next.js 共通 Dockerfile
# FINAL STABLE MONOREPO RUNTIME EDITION
# =====================================================================

# =====================================================================
# Stage 1: Builder
# =====================================================================
FROM node:20-slim AS builder
ENV NODE_ENV=development
# ---------------------------------------------------------------------
# Build Arguments
# ---------------------------------------------------------------------
ARG PROJECT_NAME

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MEDIA_URL
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_DEBUG_MODE

ARG INTERNAL_API_URL

# ---------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------
ENV NEXT_PUBLIC_APP_TITLE=${NEXT_PUBLIC_APP_TITLE}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_MEDIA_URL=${NEXT_PUBLIC_MEDIA_URL}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}
ENV NEXT_PUBLIC_DEBUG_MODE=${NEXT_PUBLIC_DEBUG_MODE}

ENV INTERNAL_API_URL=${INTERNAL_API_URL}

# ENV NODE_ENV=production
ENV NEXT_PRIVATE_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------------
# Work Directory
# ---------------------------------------------------------------------
WORKDIR /app

# =====================================================================
# System Packages
# =====================================================================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 \
    fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# =====================================================================
# Package Files
# monorepo root context architecture
# =====================================================================
COPY ${PROJECT_NAME}/package.json ./
COPY ${PROJECT_NAME}/package-lock.json ./

# optional
COPY ${PROJECT_NAME}/tsconfig.json ./tsconfig.json

# optional next config
COPY ${PROJECT_NAME}/next.config.* ./

# =====================================================================
# NPM Runtime Stabilization
# =====================================================================
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm cache clean --force

# =====================================================================
# Install Dependencies
# =====================================================================
RUN npm install \
    --legacy-peer-deps \
    --no-audit \
    --progress=false \
    --unsafe-perm=true

RUN cat package.json
RUN echo $NODE_ENV
# =====================================================================
# Shared Semantic Layer
# =====================================================================
COPY shared/ ./shared/

# =====================================================================
# Project Source
# IMPORTANT:
# docker-compose build.context: ./
# =====================================================================
COPY ${PROJECT_NAME}/ ./

# =====================================================================
# Cleanup Cache
# =====================================================================
RUN rm -rf \
    .next \
    .cache \
    node_modules/.cache

# =====================================================================
# Next.js Build
# =====================================================================
RUN node node_modules/next/dist/bin/next build

# =====================================================================
# Stage 2: Runner
# =====================================================================
FROM node:20-slim AS runner

# ---------------------------------------------------------------------
# Runtime Arguments
# ---------------------------------------------------------------------
ARG PROJECT_NAME

# ---------------------------------------------------------------------
# Runtime Environment
# ---------------------------------------------------------------------
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------------
# Work Directory
# ---------------------------------------------------------------------
WORKDIR /app

# =====================================================================
# Runtime Packages
# =====================================================================
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# =====================================================================
# Runtime User
# =====================================================================
RUN addgroup --system --gid 1001 nodejs || true && \
    adduser --system --uid 1001 nextjs || true

# =====================================================================
# Standalone Runtime Assets
# =====================================================================
COPY --from=builder /app/public ./public

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/standalone ./

COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/static ./.next/static

# =====================================================================
# Flatten Standalone Structure
# monorepo standalone normalization
# =====================================================================
RUN for dir in \
    next-avflash \
    next-tiper \
    next-bic-saving \
    next-bicstation; do \
      if [ -d "./$dir" ]; then \
        cp -r ./$dir/. . && rm -rf ./$dir; \
      fi; \
    done

# =====================================================================
# Cleanup
# =====================================================================
RUN rm -rf \
    .next/cache \
    node_modules/.cache

# =====================================================================
# Permissions
# =====================================================================
RUN chown -R nextjs:nodejs /app

# =====================================================================
# Runtime User
# =====================================================================
USER nextjs

# =====================================================================
# Port
# =====================================================================
EXPOSE 3000

# =====================================================================
# Start
# =====================================================================
CMD ["node", "server.js"]