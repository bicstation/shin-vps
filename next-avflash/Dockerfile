# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (Node 20 / Shared Library 物理同期版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# 💡 ビルド引数の定義
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ARG PROJECT_NAME=next-avflash

ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのセットアップ (ビルドに必要な最小限)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 💡 1. 物理構造の先行コピー
# Webpackが迷わないよう、依存関係インストールの前に shared を直下に配置します
COPY shared/ ./shared/

# 💡 2. アプリ本体のコピー (プロジェクト名を変数で受ける)
# ※ docker-compose の context: . を前提
COPY ${PROJECT_NAME}/ ./

# 💡 3. 依存関係のインストール
# shared フォルダが既に ./shared にあるため、依存解決がスムーズに進みます
RUN npm cache clean --force
RUN npm install --include=optional

# 💡 4. クリーンビルドの実行
# Turbopackのエラーを避け、確実な Webpack ビルドを強制
RUN rm -rf .next .cache node_modules/.cache
RUN npx next build

# --- ステージ 2: プロダクションステージ ---
FROM node:20-slim AS runner 

WORKDIR /app

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ 成果物のコピー (standalone モードを利用)
# public と static は個別にコピーが必要
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 💡 5. standalone 後のディレクトリ展開
# standalone は内部にプロジェクト名の階層を作るため、トップレベルに引き出す
# (next-avflash, next-tiper, next-bicstation, next-bic-saving 全対応)
RUN for dir in next-avflash next-tiper next-bicstation next-bic-saving; do \
      if [ -d "./$dir" ]; then \
        cp -r ./$dir/. . && rm -rf ./$dir; \
      fi; \
    done

USER nextjs
EXPOSE 3000

# Next.js standalone の起動ファイル
CMD ["node", "server.js"]