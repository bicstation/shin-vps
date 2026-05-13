# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / Shared Library 安定版)
# =====================================================================

# ---------------------------------------------------------------------
# Stage 1: Builder
# ---------------------------------------------------------------------
FROM node:20-slim AS builder

# =====================================================================
# Build Arguments
# =====================================================================
ARG PROJECT_NAME
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# =====================================================================
# Environment
# =====================================================================
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# =====================================================================
# OS Packages
# =====================================================================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libc6 \
    libstdc++6 \
    fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# =====================================================================
# Shared Library Copy
# ---------------------------------------------------------------------
COPY shared/ ./shared/

# =====================================================================
# Project Source Copy
# ---------------------------------------------------------------------
COPY ${PROJECT_NAME}/ ./  # root context 前提

# =====================================================================
# Cleanup Old Cache
# ---------------------------------------------------------------------
RUN rm -rf .next .cache node_modules/.cache

# =====================================================================
# NPM Install
# ---------------------------------------------------------------------
RUN npm cache clean --force
RUN npm install --include=optional --unsafe-perm=true

# =====================================================================
# Next.js Build
# ---------------------------------------------------------------------
RUN node node_modules/next/dist/bin/next build

# ---------------------------------------------------------------------
# Stage 2: Runner
# ---------------------------------------------------------------------
FROM node:20-slim AS runner

WORKDIR /app

# =====================================================================
# Runtime Packages
# ---------------------------------------------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# =====================================================================
# Runtime User
# ---------------------------------------------------------------------
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# =====================================================================
# Runtime Environment
# ---------------------------------------------------------------------
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# =====================================================================
# Standalone Output Copy
# ---------------------------------------------------------------------
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# =====================================================================
# Flatten Standalone Project Directories
# ---------------------------------------------------------------------
RUN for dir in next-avflash next-tiper next-bicstation next-bic-saving; do \
      if [ -d "./$dir" ]; then \
        cp -r ./$dir/. . && rm -rf ./$dir; \
      fi; \
    done

# =====================================================================
# Runtime User & Port
# ---------------------------------------------------------------------
USER nextjs
EXPOSE 3000

# =====================================================================
# Start Command
# ---------------------------------------------------------------------
CMD ["node", "server.js"]