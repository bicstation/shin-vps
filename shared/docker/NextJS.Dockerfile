# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (AI・管理画面・構造自動適応版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# ビルド引数の定義
ARG PROJECT_NAME
ARG NEXT_PUBLIC_API_URL

WORKDIR /app

# 1. 必要最低限のOSライブラリ (Next.jsの動作に必須)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 2. プロジェクト本体を /app 直下に展開
# $(PROJECT_NAME) フォルダの中身（next.config.mjs等）が /app 直下に来るようにコピーします
COPY ${PROJECT_NAME}/ ./

# ✅ 3. 親階層の「共通 shared フォルダ」を /app/shared へコピー
COPY shared/ ./shared/

# ✅ 4. ファイル配置の自動検証 (重要：エラー回避のため柔軟にログ出力)
# components/layout 階層があってもなくても、shared フォルダが存在すれば続行します
RUN echo "--- 📂 Checking Directory Structure ---" && \
    ls -d shared && \
    ls -R shared/ && \
    echo "✅ Shared directory structure check completed" || (echo "❌ Shared directory not found" && exit 1)

# ✅ 5. 依存関係の強制解決
# 4つのドメインの管理画面やAIチャットで共通して使うライブラリを確実にインストールします
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge --save

# 6. プロジェクト固有の依存関係インストール
RUN npm install --include=optional

# 7. 環境変数の注入 (ビルド時に必要)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# ✅ 8. ビルド実行
# standalone 出力が next.config.mjs で設定されている必要があります
RUN npx next build

# --- ステージ 2: 実行ステージ ---
FROM node:20-slim AS runner
WORKDIR /app

# 実行環境の設定
ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# 実行時に必要なOSライブラリの最小構成
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# セキュリティ強化：実行ユーザーの作成
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ✅ 9. 成果物の配置 (standalone モード)
# builderステージから、Next.jsを最小限で動かすためのファイルをコピーします
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 実行ユーザーに切り替え
USER nextjs
EXPOSE 3000

# Next.js サーバー起動
CMD ["node", "server.js"]