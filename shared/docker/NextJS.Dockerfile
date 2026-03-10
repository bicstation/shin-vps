# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (Node 20 安定版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# ビルド引数の定義
ARG PROJECT_NAME
ARG NEXT_PUBLIC_API_URL

WORKDIR /app

# 1. 必要最低限のOSライブラリ
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 2. プロジェクト本体のコピー
COPY ${PROJECT_NAME}/ ./

# ✅ 3. 共通 shared フォルダを /app/shared へコピー
COPY shared/ ./shared/

# ✅ 4. 依存関係のインストール
# npm 9+ では unsafe-perm は不要です。
# 権限問題を避けるため、rootユーザーのまま実行を継続します。
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge \
    gray-matter remark remark-html --save
RUN npm install --include=optional

# 5. 環境変数の注入
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

# ✅ 6. ビルド実行 (npxを使わず node で直接実行することで実行権限をバイパス)
RUN rm -rf .next .cache node_modules/.cache
RUN node node_modules/next/dist/bin/next build

# --- ステージ 2: 実行ステージ ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ✅ 7. 成果物の配置 (standalone モード)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ✅ 8. 構造の自動適応 (server.js をルートに配置)
# 各プロジェクトフォルダをルートに展開します
RUN cp -r .next/standalone/* . 2>/dev/null || true
RUN rm -rf ./next-bicstation ./next-tiper ./next-bic-saving ./next-avflash

USER nextjs
EXPOSE 3000

# server.js を実行して起動
CMD ["node", "server.js"]