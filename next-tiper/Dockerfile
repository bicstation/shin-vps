# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-tiper 安定版)
# =====================================================================

# ---------------------------------------------------------------------
# Stage 1: Builder
# ---------------------------------------------------------------------
FROM node:20-slim AS builder

# Build Args
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ARG PROJECT_NAME=next-tiper

ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ---------------------------------------------------------------------
# OS Packages
# ---------------------------------------------------------------------
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
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
COPY next-tiper/ ./  

# ---------------------------------------------------------------------
# Cleanup previous cache
# ---------------------------------------------------------------------
RUN rm -rf .next .cache node_modules/.cache

# ---------------------------------------------------------------------
# NPM Install
# ---------------------------------------------------------------------
RUN npm cache clean --force
RUN npm install --include=optional --unsafe-perm=true
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge --save

# ---------------------------------------------------------------------
# Next.js Build
# ---------------------------------------------------------------------
RUN node node_modules/next/dist/bin/next build

# ---------------------------------------------------------------------
# Stage 2: Runner
# ---------------------------------------------------------------------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Runtime OS packages
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Runtime User
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ---------------------------------------------------------------------
# Copy Standalone Output
# ---------------------------------------------------------------------
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ---------------------------------------------------------------------
# Flatten Standalone Directory
# ---------------------------------------------------------------------
RUN if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi
RUN rm -rf ./next-bicstation ./next-bic-saving ./next-avflash

# ---------------------------------------------------------------------
# Runtime User & Port
# ---------------------------------------------------------------------
USER nextjs
EXPOSE 3000

# ---------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------
CMD ["node", "server.js"]