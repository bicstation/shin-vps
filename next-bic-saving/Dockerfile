# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-bic-saving 専用)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# ビルド引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# OSパッケージ
RUN sed -i 's|http://deb.debian.org/debian |http://ftp.jp.debian.org/debian |g' /etc/apt/sources.list || true
RUN echo "deb http://security.debian.org/debian-security bookworm-security main" > /etc/apt/sources.list.d/security.list
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 1. アプリ本体のコピー
COPY . .
RUN rm -rf ./shared

# 2. shared フォルダのコピー
COPY shared/ ./shared/

# 3. npm 依存関係インストール
RUN npm cache clean --force
RUN npm install --include=optional --unsafe-perm=true

# 4. クリーンビルド
RUN rm -rf .next .cache node_modules/.cache
RUN npx next build

# --- ステージ 2: プロダクション ---
FROM node:20-slim AS runner

WORKDIR /app

# 最小限セットアップ
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザー
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# 成果物コピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# standalone 配下のプロジェクト名ディレクトリをルートに展開
RUN if [ -d "./next-bic-saving" ]; then cp -r ./next-bic-saving/. . && rm -rf ./next-bic-saving; fi

USER nextjs
EXPOSE 3000

# 起動
CMD ["node", "server.js"]