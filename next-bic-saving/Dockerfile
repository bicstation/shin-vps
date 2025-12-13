# Docker Composeからビルド引数を受け取る
ARG NEXT_PUBLIC_APP_TITLE

# --- ステージ 1: ビルドステージ (依存関係のインストールと本番ビルド) ---
# 🛑 修正: glibc互換性のため、node:20-slim (Debianベース)へ変更
FROM node:20-slim AS builder 

# 実行ユーザーの定義
# node:slim は Debian ベースであり、addUserコマンドを使用します
RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 作業ディレクトリ
WORKDIR /app

# ★ 修正: ビルド時に使用できるよう、環境変数として設定
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# ----------------------------------------------------
# 🛑 追加: Debianベースで日本語フォントをインストール (RUN 1行で最適化)
# ----------------------------------------------------
# パッケージリストを更新し、日本語フォントをインストール後、キャッシュをクリーンアップ
RUN apt-get update \
    && apt-get install -y fonts-ipafont-gothic \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# ----------------------------------------------------

# アプリケーションコードをコピー
COPY . .

# SSG/SSRのための本番ビルドを実行
RUN npm run build

# --- ステージ 2: プロダクション (本番実行) ステージ ---
# 🛑 修正: node:20-slim (Debianベース)へ変更
FROM node:20-slim AS runner

# 実行ユーザーの定義 (builderステージと同じuid/gidを使用)
RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 作業ディレクトリ
WORKDIR /app

# ビルドステージから必要なファイルをコピー
# .next フォルダ、node_modules、publicフォルダ、next.config.* は必須
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# next.config.ts/mjs のファイル名はプロジェクトに合わせて適宜修正してください
# COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts 

# Node.jsのエンコーディングをUTF-8に設定
ENV LANG=C.UTF-8

# 静的コンテンツを配信するためのユーザーに変更
USER nextjs

# ビルドしたアプリケーションを起動
EXPOSE 3000
CMD ["npm", "start"]