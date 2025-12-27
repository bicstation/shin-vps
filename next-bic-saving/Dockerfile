# /next-xxx/Dockerfile

# 1. Docker Composeからビルド引数を受け取る
ARG NEXT_PUBLIC_APP_TITLE

# --- ステージ 1: ビルドステージ (依存関係のインストールと本番ビルド) ---
FROM node:20-slim AS builder 

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

WORKDIR /app

# ----------------------------------------------------
# ✅ リポジトリ設定の最適化
# ----------------------------------------------------
# 1. まず標準リポジトリを日本ミラーに切り替え
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list

# 2. セキュリティリポジトリのパス問題を修正（ここをより汎用的に）
# bookworm-security の 404 エラーを回避するため、ミラーではなく公式の正しいパスを指定し直します
RUN sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || true

# 3. アップデートとインストール
RUN apt-get update && \
    apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ビルド時に使用できるよう環境変数として設定
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

# 依存関係のコピーとインストール
COPY package.json ./
COPY package-lock.json ./

# 🛑 修正: Linux用バイナリ(SWC)を確実に含めるため optional 依存関係もインストール
RUN npm install --include=optional

# アプリケーションコードをコピー
COPY . .

# SSG/SSRのための本番ビルドを実行
RUN npm run build

# --- ステージ 2: プロダクション (本番実行) ステージ ---
FROM node:20-slim AS runner

RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

WORKDIR /app

# 🛑 実行環境にも標準ライブラリを入れておく (安定動作のため)
RUN apt-get update && apt-get install -y \
    libc6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ビルドステージから必要なファイルをコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# 汎用的に next.config.* をコピーするように変更
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./

# Node.jsのエンコーディングと環境変数を設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]