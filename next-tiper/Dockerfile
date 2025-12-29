# 💡 1. 最初のステージよりも前に ARG を定義することで、ビルド全体で参照可能にします
ARG NEXT_PUBLIC_APP_TITLE

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

# 💡 builder ステージ内でも再度宣言することで、ビルドプロセス（npm run build）に変数を焼き込みます
ARG NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

WORKDIR /app

# ✅ リポジトリ設定の修正（ビルドステージ用：404エラー対策）
# メインリポジトリを日本ミラーに切り替え
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list

# セキュリティリポジトリは日本ミラー側の不整合を避けるため、公式(deb.debian.org)に強制固定
RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 依存関係のインストール（キャッシュ効率のため package ファイルを先にコピー）
COPY package.json package-lock.json ./
RUN npm install --include=optional

# ソースコードのコピーとビルド実行
COPY . .
# ※ next.config.mjs で output: 'standalone' が設定されている必要があります
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:18-slim AS runner 

WORKDIR /app

# ✅ 実行環境(runner)でも apt-get update が失敗しないよう同様にリポジトリ修正を実施
# ここを修正しないと、第2ステージのビルドで 404 エラーが発生します
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 本番実行に必要な最小限のライブラリ（libc6）をインストール
RUN apt-get update && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --system --gid 1001 nodejs || true && \
    adduser --system --uid 1001 nextjs || true

ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV PORT 3000
# 💡 コンテナ外（Traefik等）からの通信を受け付けるために必須の設定
ENV HOSTNAME "0.0.0.0"

# ✅ Standalone モード用の成果物をコピー（権限を nextjs ユーザーに変更）
# standalone フォルダに必要なファイルがすべて集約されています
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# ✅ Standalone モードの起動コマンド
# server.js は .next/standalone ディレクトリの直下に生成されています
CMD ["node", "server.js"]