# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (v3.2 パス解決・完全版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

ARG PROJECT_NAME
ARG NEXT_PUBLIC_API_URL

WORKDIR /app

# 1. OSライブラリの最小インストール
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 2. package.json のコピー (PROJECT_NAME フォルダから取得)
COPY ${PROJECT_NAME}/package*.json ./

# ✅ 3. 全依存関係のインストール
RUN npm install --frozen-lockfile || npm install

# ✅ 4. 追加パッケージの注入
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge \
    gray-matter remark remark-html --save

# ✅ 5. ソースコードと shared フォルダをコピー
# ${PROJECT_NAME} の中身を /app 直下に展開
COPY ${PROJECT_NAME}/ ./
COPY shared/ ./shared/

# 6. 環境変数の注入
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_PRIVATE_STANDALONE=true 

# ✅ 7. ビルド実行
RUN rm -rf .next .cache node_modules/.cache
RUN chmod +x ./node_modules/.bin/next
RUN ./node_modules/.bin/next build

# --- ステージ 2: 実行ステージ ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ✅ 8. 成果物の配置
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]