# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-bicstation 専用)
# =====================================================================

FROM node:20-slim AS builder 

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# OS パッケージ
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 1. ソースコピー + shared
COPY . .
RUN rm -rf ./shared
COPY shared/ ./shared/

# 2. npm 依存関係インストール（権限回避）
RUN npm cache clean --force
RUN npm install --include=optional --unsafe-perm=true

# 3. クリーンビルド
RUN rm -rf .next .cache node_modules/.cache
RUN node node_modules/next/dist/bin/next build

# --- ステージ 2: プロダクション ---
FROM node:20-slim AS runner 
WORKDIR /app

RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV NEXT_PUBLIC_BASE_PATH=""

RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 成果物配置
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# standalone 展開
RUN cp -r .next/standalone/* . 2>/dev/null || true
RUN rm -rf ./next-bicstation ./next-tiper ./next-bic-saving ./next-avflash

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]