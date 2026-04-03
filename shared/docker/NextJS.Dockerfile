# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (v3.9 引数継承・展開修正版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# ビルド引数の定義
ARG PROJECT_NAME
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_PATH

WORKDIR /app

# 1. OSライブラリの最小インストール
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 2. 物理構造の先行配置 (Shared & Django)
# 依存関係の解決前に配置することで、npm install 時の型定義エラーを防ぎます
COPY shared/ ./shared/
COPY django/ ./django/

# ✅ 3. プロジェクト設定のコピー
COPY ${PROJECT_NAME}/package*.json ./
COPY ${PROJECT_NAME}/tsconfig*.json ./

# ✅ 4. インストール (Reactバージョン競合回避のため legacy-peer-deps を付与)
RUN npm install --legacy-peer-deps || npm install

# ✅ 5. 必須パッケージの確実な注入
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge \
    gray-matter remark remark-html --save

# ✅ 6. プロジェクト本体のソースコードを全面展開
COPY ${PROJECT_NAME}/ ./

# 🛠️ 7. パス解決の物理的強制
# Webpackが内部から django フォルダを確実に参照できるように物理コピー
RUN mkdir -p ./shared/django && cp -r ./django/* ./shared/django/ || true

# 8. 環境変数の注入
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NODE_ENV=production \
    NEXT_PRIVATE_STANDALONE=true 

# ✅ 9. ビルド実行
RUN rm -rf .next .cache node_modules/.cache && \
    chmod +x ./node_modules/.bin/next && \
    ./node_modules/.bin/next build

# --- ステージ 2: 実行ステージ (軽量化) ---
FROM node:20-slim AS runner
WORKDIR /app

# 🚩 重要: 第2ステージでも ARG を再宣言しないと PROJECT_NAME は空になります
ARG PROJECT_NAME
ENV NODE_ENV=production \
    HOSTNAME="0.0.0.0" \
    PORT=3000

# 非特権ユーザー作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ✅ 10. 成果物の配置 (Standaloneモード)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 💡 11. standalone 後のディレクトリ階層自動調整
# Next.js 15 standalone はプロジェクト名のフォルダを作るため、中身をトップに移動
# PROJECT_NAME が正しく継承されているため、安全に cp 可能です
RUN if [ -n "${PROJECT_NAME}" ] && [ -d "./${PROJECT_NAME}" ]; then \
      cp -r ./${PROJECT_NAME}/. . && \
      rm -rf ./${PROJECT_NAME}; \
    fi

USER nextjs
EXPOSE 3000

# サーバー起動
CMD ["node", "server.js"]