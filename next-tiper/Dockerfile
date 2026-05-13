# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-tiper 安定版)
# =====================================================================

FROM node:20-slim AS builder 

ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# OS パッケージ
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 1. ソースコピー + shared フォルダ
COPY . .
RUN rm -rf ./shared .next node_modules
COPY shared/ ./shared/

# 2. npm 依存関係インストール（権限回避 + ネットワーク耐性）
RUN npm cache clean --force
RUN npm install --include=optional --unsafe-perm=true
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge --save

# 3. ビルド
RUN node node_modules/next/dist/bin/next build

# --- ステージ 2: runner ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 4. 成果物コピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# standalone 配下展開
RUN if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi
RUN rm -rf ./next-bicstation ./next-bic-saving ./next-avflash

USER nextjs
EXPOSE 3000

# 起動
CMD ["node", "server.js"]