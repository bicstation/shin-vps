# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (Next.js 15/16 構造最適化版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

ARG PROJECT_NAME
ARG NEXT_PUBLIC_API_URL

WORKDIR /app

# 1. 必要最低限のOSライブラリ
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 2. まずプロジェクト本体を /app 直下に展開
# これにより next.config.mjs や tsconfig.json が配置されます
# ※ この時、プロジェクト内の shared フォルダもコピーされます
COPY ${PROJECT_NAME}/ ./

# ✅ 3. 親階層にある「本物の共通 shared」を /app/shared へ上書きコピー
# 手順2でコピーされた不完全な shared フォルダを、ここで最新の共通部品で上書きします
# これにより、Next.jsは直下の shared フォルダを正しく認識できます
COPY shared/ ./shared/

# ✅ 4. ファイル配置の検証 (デバッグ用ログ)
# shared の中に components が存在するかビルド時に確認します
RUN ls -d shared/components && echo "✅ Shared directory is ready" || (echo "❌ Shared directory error" && exit 1)

# 5. 依存関係インストール
RUN npm install --include=optional

# 6. ビルド実行
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Next.js 15/16 の standalone 出力を有効化するためのビルド
RUN npx next build

# --- ステージ 2: 実行ステージ ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの作成 (rootでの実行を避ける)
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ✅ 7. 成果物の配置 (standalone モード)
# .next/standalone 内には server.js と必要な node_modules が含まれます
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# Next.js standalone モードの起動コマンド
CMD ["node", "server.js"]