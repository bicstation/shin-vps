# =====================================================================
# 🚀 SHIN-VPS NEXT.JS 共通 Dockerfile (v3.6 パス解決・完全版)
# =====================================================================

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

ARG PROJECT_NAME
ARG NEXT_PUBLIC_API_URL

WORKDIR /app

# 1. OSライブラリの最小インストール (ビルドに必要な libc 等)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 2. package.json のコピー (各プロジェクトフォルダから取得)
# ここで tsconfig.json も確実に含めるため、ワイルドカードや個別コピーを検討
COPY ${PROJECT_NAME}/package*.json ./
COPY ${PROJECT_NAME}/tsconfig*.json ./

# ✅ 3. 全依存関係のインストール
RUN npm install --frozen-lockfile || npm install

# ✅ 4. 追加パッケージの注入 (AI・UIライブラリ)
RUN npm install @google/generative-ai lucide-react clsx tailwind-merge \
    gray-matter remark remark-html --save

# ✅ 5. 全ソースコードの依存関係をコピー
# 各プロジェクト固有のソースを展開
COPY ${PROJECT_NAME}/ ./

# 📁 共通ロジック (APIクライアント等)
COPY shared/ ./shared/

# 📁 重要: Django側のマスタデータ・型定義の参照を解決するためにコピー
COPY django/ ./django/

# 🛠️ 【パス解決の追加】
# shared/lib/api/index.ts 等から '../django/master' を見つけやすくするため
# 物理的な階層を一致させるシンボリックリンクを作成
RUN ln -s /app/django /app/shared/django || true

# 6. 環境変数の注入
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production
ENV NEXT_PRIVATE_STANDALONE=true 

# ✅ 7. ビルド実行
# キャッシュをクリアし、実行権限を付与してから Next.js ビルドを開始
RUN rm -rf .next .cache node_modules/.cache
RUN chmod +x ./node_modules/.bin/next
RUN ./node_modules/.bin/next build

# --- ステージ 2: 実行ステージ (軽量化) ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# セキュリティのための非特権ユーザー作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ✅ 8. 成果物の配置 (Standaloneモード)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# サーバー起動
CMD ["node", "server.js"]