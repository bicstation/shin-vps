# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-tiper 専用)
# =====================================================================

# --- ステージ 1: ビルドステージ (Node 20 に統一) ---
FROM node:20-slim AS builder 

ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのセットアップ (ビルドの安定化)
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ 1. 物理コピー（Shared 実体化方式）
# アプリ本体をコピー
COPY next-tiper/ ./

# 空の残骸やシンボリックリンクを徹底排除
RUN rm -rf ./shared .next node_modules

# 本物の shared フォルダをルートから実体としてコピー
COPY shared/ ./shared/

# ✅ 2. 依存関係のインストール
RUN npm cache clean --force
RUN npm install --include=optional

# ✅ 3. ビルド実行
# Turbopack (Wasm) エラーを回避し、Webpackで確実にビルドを通す
RUN npx next build

# --- ステージ 2: runner (Node 20 に統一) ---
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# 実行環境に必要な OS パッケージ
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ユーザー定義（セキュリティ強化）
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ✅ 4. 成果物の配置 (standalone モード)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 💡 standalone配下のプロジェクト名ディレクトリをルートに展開
# これにより / 直下での動作を保証します
RUN if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi

# 不要なサブディレクトリを掃除（他の設定との整合性のため）
RUN rm -rf ./next-bicstation ./next-bic-saving ./next-avflash

# 静的ファイルのコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js を実行して起動
CMD ["node", "server.js"]