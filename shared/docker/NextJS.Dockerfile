# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (v4.0 修正済完全版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

ARG PROJECT_NAME
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_PATH

WORKDIR /app

# 1. OSライブラリの最小インストール
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. 物理構造の先行配置
COPY shared/ ./shared/
COPY django/ ./django/

# 3. プロジェクト設定のコピー
COPY ${PROJECT_NAME}/package*.json ./
COPY ${PROJECT_NAME}/tsconfig*.json ./

# 4. インストール (ビルド前に firebase を含めて実行)
RUN npm install --legacy-peer-deps || npm install
RUN npm install firebase @google/generative-ai lucide-react clsx tailwind-merge \
    gray-matter remark remark-html --save

# 5. ソースコードの展開
COPY ${PROJECT_NAME}/ ./

# 6. 環境変数の注入
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NODE_ENV=production \
    NEXT_PRIVATE_STANDALONE=true 

# 7. ビルド実行 (firebase インストール後なのでエラーを回避)
RUN rm -rf .next .cache && \
    chmod +x ./node_modules/.bin/next && \
    ./node_modules/.bin/next build

# --- ステージ 2: 実行ステージ ---
FROM node:20-slim AS runner
WORKDIR /app

ARG PROJECT_NAME
ENV NODE_ENV=production \
    HOSTNAME="0.0.0.0" \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN if [ -n "${PROJECT_NAME}" ] && [ -d "./${PROJECT_NAME}" ]; then \
      cp -r ./${PROJECT_NAME}/. . && \
      rm -rf ./${PROJECT_NAME}; \
    fi

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]