# /home/maya/shin-vps/next-bic-saving/Dockerfile

# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-bic-saving 専用)
# =====================================================================

# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ (Node 20 に統一) ---
FROM node:20-slim AS builder 

# ビルド引数の設定
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのセットアップ（日本ミラーを使用して安定化）
RUN sed -i 's|http://deb.debian.org/debian |http://ftp.jp.debian.org/debian |g' /etc/apt/sources.list || true
RUN echo "deb http://security.debian.org/debian-security bookworm-security main" > /etc/apt/sources.list.d/security.list

RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ 1. ファイルの物理コピー
# 💡 注意: shared の取り扱い
# アプリ本体をコピーする際、もし古いリンク形式のsharedが含まれていれば削除
COPY . .
RUN rm -rf ./shared

# ルートの shared フォルダを「実体」として /app/shared にコピー
# これにより、docker-compose で指定した shared が確実に同期されます
COPY shared/ ./shared/

# ✅ 2. 依存関係のインストール
RUN npm cache clean --force
RUN npm install --include=optional

# ✅ 3. クリーンビルドの実行
# Turbopack の Wasm エラーを回避するため npx next build を使用
RUN rm -rf .next .cache node_modules/.cache
RUN npx next build

# --- ステージ 2: プロダクションステージ (Node 20 に統一) ---
FROM node:20-slim AS runner

WORKDIR /app

# 実行環境の最小限のセットアップ
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# ✅ 成果物の配置 (standaloneモード用)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 💡 standalone配下のプロジェクト名ディレクトリをルートに展開
# Next.js の出力構造に合わせて、カレントディレクトリに引き出します
RUN if [ -d "./next-bic-saving" ]; then cp -r ./next-bic-saving/. . && rm -rf ./next-bic-saving; fi

# 静的ファイルのコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js を起動
CMD ["node", "server.js"]