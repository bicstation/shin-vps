# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / Shared Library 同期版)
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

# OS パッケージ最小限
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 1. shared フォルダの先行コピー
COPY shared/ ./shared/

# 2. アプリ本体のコピー (build.context 内全体)
COPY . .

# 3. npm 依存関係インストール
RUN npm cache clean --force
RUN npm install --include=optional --unsafe-perm=true

# 4. クリーンビルド
RUN rm -rf .next .cache node_modules/.cache
RUN npx next build

# --- ステージ 2: プロダクション ---
FROM node:20-slim AS runner 

WORKDIR /app

# 実行ユーザー
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 成果物コピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# standalone 配下のプロジェクト名ディレクトリをルートに展開
RUN for dir in next-avflash next-tiper next-bicstation next-bic-saving; do \
      if [ -d "./$dir" ]; then \
        cp -r ./$dir/. . && rm -rf ./$dir; \
      fi; \
    done

USER nextjs
EXPOSE 3000

# 起動
CMD ["node", "server.js"]