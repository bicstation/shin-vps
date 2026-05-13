# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-bicstation 専用)
# =====================================================================

# ---------------------------------------------------------------------
# Stage 1: Builder
# ---------------------------------------------------------------------
FROM node:20-slim AS builder 

# Build Args
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ARG PROJECT_NAME=next-bicstation

ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ---------------------------------------------------------------------
# OS Packages
# ---------------------------------------------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# Shared Library
# ---------------------------------------------------------------------
COPY shared/ ./shared/

# ---------------------------------------------------------------------
# Project Source
# ---------------------------------------------------------------------
COPY next-bicstation/ ./  

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
# Runtime User
# ---------------------------------------------------------------------
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ---------------------------------------------------------------------
# Runtime Environment
# ---------------------------------------------------------------------
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV NEXT_PUBLIC_BASE_PATH=""

# ---------------------------------------------------------------------
# Standalone Output Copy
# ---------------------------------------------------------------------
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ---------------------------------------------------------------------
# Flatten Standalone
# ---------------------------------------------------------------------
RUN cp -r .next/standalone/* . 2>/dev/null || true
RUN rm -rf ./next-bicstation ./next-tiper ./next-bic-saving ./next-avflash

# ---------------------------------------------------------------------
# Runtime User & Port
# ---------------------------------------------------------------------
USER nextjs
EXPOSE 3000

# ---------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------
CMD ["node", "server.js"]