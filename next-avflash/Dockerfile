# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (Node 20 / Shared Library 完全同期版)
# =====================================================================

# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ (Node 20 に統一) ---
FROM node:20-slim AS builder 

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのセットアップ
# TurbopackやSWCが要求する libc6 等を確実にインストール
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 💡 1. 物理構造のコピー (docker-compose の context: . を前提)
# ルートの shared を WORKDIR の外側（/shared）に一度退避
COPY shared/ ../shared/

# ★重要：アプリ本体のコピー (プロジェクトごとにここを書き換え)
# 例: next-tiper/ なら COPY next-tiper/ ./
COPY next-avflash/ ./

# 💡 2. 共通 shared をプロジェクト内に物理配置
# 既存の shared があれば削除し、最新の shared を強制的にコピー
RUN rm -rf ./shared && cp -r ../shared ./shared

# 💡 3. 依存関係のインストール
RUN npm cache clean --force
RUN npm install --include=optional

# 💡 4. クリーンビルドの実行
RUN rm -rf .next .cache node_modules/.cache

# 🔥 Turbopack(Wasm)のエラーを完全に回避するため、標準の Webpack ビルドを強制
# ※ npm run build が --turbo を含んでいても、npx next build なら安全にビルドされます
RUN npx next build

# --- ステージ 2: プロダクションステージ (実行環境も Node 20 に統一) ---
FROM node:20-slim AS runner 

WORKDIR /app

# 実行環境に必要な最小限のライブラリ
RUN apt-get update || true && \
    apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義 (セキュリティ強化)
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ 成果物のコピーと配置
COPY --from=builder /app/public ./public

# standalone モードの成果物をコピー (shared 等の依存関係もここに含まれる)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 💡 5. standalone 後のディレクトリ展開処理
# Next.js の standalone モードはプロジェクト名の階層を作るため、直下に引き出す
RUN if [ -d "./next-avflash" ]; then cp -r ./next-avflash/. . && rm -rf ./next-avflash; fi && \
    if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi && \
    if [ -d "./next-bicstation" ]; then cp -r ./next-bicstation/. . && rm -rf ./next-bicstation; fi && \
    if [ -d "./next-bic-saving" ]; then cp -r ./next-bic-saving/. . && rm -rf ./next-bic-saving; fi

# 静的ファイルの配置
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js を起動
CMD ["node", "server.js"]