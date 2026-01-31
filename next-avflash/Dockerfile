# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ リポジトリ設定の徹底修正（404エラー回避）
# 通常のリポジトリは日本ミラー、セキュリティリポジトリは bookworm-security 形式に修正
RUN if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources; \
    fi && \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

# セキュリティリポジトリの不整合を直すための「力技」修正
RUN echo "deb http://deb.debian.org/debian-security bookworm-security main" > /etc/apt/sources.list.d/security.list || true

# エラーが出ても無視して次に進ませる
RUN apt-get update || true
RUN apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 💡 物理構造のコピー
COPY shared/ ../shared/
COPY next-avflash/ ./

# 💡 共有ディレクトリを物理コピーし、パスを調整
RUN rm -rf ./shared && cp -r ../shared ./shared
RUN find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|../shared/|@shared/|g' || true

# 依存関係のインストールとビルド
RUN npm cache clean --force
RUN npm install --include=optional
RUN rm -rf .next .cache node_modules/.cache
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:18-slim AS runner 

WORKDIR /app

# 実行環境でもリポジトリ修正（エラーを無視して続行）
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update || true
RUN apt-get install -y libc6 && apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ Standalone 成果物のコピーと配置
COPY --from=builder /app/public ./public

# standalone の中身をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 💡 重要：サブディレクトリ（プロジェクト名）の中身を WORKDIR 直下に移動
# これにより /app/server.js が確実に存在し、code 0 終了を防ぎます
RUN if [ -d "./next-avflash" ]; then cp -r ./next-avflash/. . && rm -rf ./next-avflash; fi && \
    if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi

# 静的ファイルの配置
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# 直接 server.js を叩く（一番確実な方法）
CMD ["node", "server.js"]