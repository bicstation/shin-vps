# =====================================================================
# 🚀 SHIN-VPS NEXT.JS Dockerfile (Node 20 / next-bicstation 専用)
# =====================================================================

# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ (Node 20 に統一) ---
FROM node:20-slim AS builder 

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL

# 🚀 パスを強制的に空にし、ビルド時に「/」用としてJSを焼く
ENV NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのインストール (Node 20 / Debian Bookworm 対応)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ 1. ファイルのコピーと Shared の実体化
COPY next-bicstation/ ./
RUN rm -rf ./shared
COPY shared/ ./shared/

# ✅ 2. 依存関係のインストール
# npm install 時に権限問題を最小限にするため unsafe-perm を有効化
RUN npm config set unsafe-perm true
RUN npm install --include=optional

# ✅ 3. クリーンビルドの実行
RUN rm -rf .next .cache node_modules/.cache

# 🚨 【重要】Permission Denied 対策：npx を使わず node で直接実行ファイルを指定
# node_modules/.bin/next は実行権限が必要なシンボリックリンクですが、
# node コマンドで実体の JS ファイルを指定すれば権限に関係なくビルドが可能です。
RUN node node_modules/next/dist/bin/next build

# --- ステージ 2: プロダクションステージ (Node 20 に統一) ---
FROM node:20-slim AS runner 
WORKDIR /app

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000
ENV NEXT_PUBLIC_BASE_PATH=""

# 実行環境に必要な OS パッケージ
RUN apt-get update && apt-get install -y --no-install-recommends libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 4. 成果物の配置 (standalone モード)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 🚀 【展開処理】特定のフォルダ名に依存せず、中身をルートに引き出す
RUN cp -r .next/standalone/* . 2>/dev/null || true

# 不要になったサブフォルダを削除してクリーンな状態にする
RUN rm -rf ./next-bicstation ./next-tiper ./next-bic-saving ./next-avflash

USER nextjs
EXPOSE 3000

# server.js を実行して起動
CMD ["node", "server.js"]