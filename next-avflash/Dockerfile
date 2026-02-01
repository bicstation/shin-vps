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

# ✅ OSパッケージのセットアップ（日本ミラーを使用して安定化）
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update || true
RUN apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 💡 1. 物理構造のコピー
# ルートの shared を WORKDIR の外側（/shared）に一度退避
COPY shared/ ../shared/

# ★重要：ビルド対象のディレクトリ「中身」を /app 直下にコピー
# ※アプリごとにここを修正してください (例: next-tiper, next-bicstation)
COPY next-avflash/ ./

# 💡 2. 共通 shared をプロジェクト内に物理配置
RUN rm -rf ./shared && cp -r ../shared ./shared

# 💡 4. 依存関係のインストールとビルド
RUN npm cache clean --force
RUN npm install --include=optional
RUN rm -rf .next .cache node_modules/.cache
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:18-slim AS runner 

WORKDIR /app

# 実行環境の最小限のセットアップ
RUN apt-get update || true && apt-get install -y libc6 && apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ 成果物のコピーと配置
COPY --from=builder /app/public ./public

# standalone モードの成果物をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 💡 5. standalone 後の展開処理
# ※アプリごとにディレクトリ名を確認してください
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