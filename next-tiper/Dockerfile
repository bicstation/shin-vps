# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-tiper 安定版)
# =====================================================================

FROM node:20-slim AS builder 

ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのセットアップ (日本ミラーへ変更して高速化)
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ 1. 物理コピー（Shared 実体化方式）
COPY next-tiper/ ./
RUN rm -rf ./shared .next node_modules
COPY shared/ ./shared/

# ✅ 2. 依存関係のインストール（ネットワーク耐性強化）
# npmのリトライ回数を増やし、タイムアウトを延長します
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm cache clean --force

# 不足ライブラリを明示的に追加しつつインストール
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge --save && \
    npm install --include=optional

# ✅ 3. ビルド実行
RUN npx next build

# --- ステージ 2: runner ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ✅ 4. 成果物の配置 (standalone モード)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# standalone配下の展開
RUN if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi
RUN rm -rf ./next-bicstation ./next-bic-saving ./next-avflash
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]