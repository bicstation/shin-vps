# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# ビルド引数を受け取る（ビルド時に環境変数に焼き込む）
ARG NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

WORKDIR /app

# ✅ リポジトリ設定の修正（404エラーを回避する完全な手順）
# 1. メインリポジトリを日本ミラーに切り替え
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list

# 2. セキュリティリポジトリを公式(deb.debian.org)に固定（日本ミラーの不整合を回避）
# builder ステージで apt-get update が失敗するのを防ぎます
RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 依存関係のインストール（高速化のため package ファイルを先にコピー）
COPY package.json package-lock.json ./
RUN npm install --include=optional

# 全ソースコードのコピー
COPY . .

# ビルド実行（next.config.mjs で output: 'standalone' が設定されている必要があります）
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:20-slim AS runner

WORKDIR /app

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ✅ 実行環境のリポジトリ修正
# runner ステージでも apt-get update が実行されるため、同様の修正を適用します
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 本番実行に必要な最小限のライブラリ（libc6）をインストール
RUN apt-get update && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production

# ✅ コンテナ外（Traefik等）からの通信を許可するために必須の設定
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# ✅ 重要: standalone モード専用のコピー設定
# 所有権を nextjs ユーザーに変更してコピーします
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 実行ユーザーの切り替え
USER nextjs
EXPOSE 3000

# ✅ Standalone モードの実行用エントリポイント
# server.js は .next/standalone ディレクトリの直下に生成されています
CMD ["node", "server.js"]