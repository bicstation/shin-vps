# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-bicstation 専用)
# =====================================================================

# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ (Node 20 に統一) ---
FROM node:20-slim AS builder 

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL

# 🚀 パスを強制的に空にし、ビルド時に「/」用としてJSを焼く
ENV NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのインストール (Node 20 / Debian Bookworm 対応)
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ 1. ファイルのコピーと Shared の実体化
# アプリ本体をコピー
COPY next-bicstation/ ./
# リンク切れや古いキャッシュを防ぐため、既存の shared を削除
RUN rm -rf ./shared

# ルートの shared フォルダを「実体」としてコピー (重要)
COPY shared/ ./shared/

# ✅ 2. 依存関係のインストール
RUN npm cache clean --force
RUN npm install --include=optional

# ✅ 3. クリーンビルドの実行
# Turbopack(Wasm)エラーを回避し、Webpackで安定ビルド
RUN rm -rf .next .cache node_modules/.cache
RUN npx next build

# --- ステージ 2: プロダクションステージ (Node 20 に統一) ---
FROM node:20-slim AS runner 
WORKDIR /app

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000
ENV NEXT_PUBLIC_BASE_PATH=""

# 実行環境に必要な OS パッケージ
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 4. 成果物の配置 (standalone モード)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 🚀 【展開処理】特定のフォルダ名に依存せず、中身をルートに引き出す
# standalone フォルダ内のサブディレクトリ（next-bicstation等）をカレントディレクトリに移動
RUN cp -r .next/standalone/* . 2>/dev/null || true

# 不要になったサブフォルダを削除してクリーンな状態にする
RUN rm -rf ./next-bicstation ./next-tiper ./next-bic-saving ./next-avflash

# staticファイルをコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js を実行して起動
CMD ["node", "server.js"]