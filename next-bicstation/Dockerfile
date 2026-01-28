# 💡 最初のステージよりも前に ARG を定義することで、ビルド全体で参照可能にします
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

# 💡 ビルド時に必要な環境変数を定義
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ リポジトリ設定の修正（404エラー対策）
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 💡 依存関係のインストールの前にキャッシュをクリア（古いライブラリの残存防止）
RUN npm cache clean --force

# 依存関係のインストール
COPY package.json ./
RUN npm install --include=optional

# ソースコードをコピー
COPY . .

# 💡 重要：ビルド直前に古い成果物を徹底的に削除（キャッシュ事故を防止）
RUN rm -rf .next .cache node_modules/.cache

# next.config.js で output: 'standalone' が設定されている前提
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:18-slim AS runner 

WORKDIR /app

# 💡 実行環境(runner)でもリポジトリ修正を実施
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

RUN apt-get update && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ Standalone モード用の成果物をコピー
# 1. 公開フォルダ
COPY --from=builder /app/public ./public

# 2. 本体（standalone フォルダの中身を直下に展開）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 3. 静的ファイルの配置
COPY --from=builder --chown=nextjs:nodejs /app/.next/static /app/.next/static

# 4. 💡 basePath 対策のダメ押し
RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true

USER nextjs
EXPOSE 3000

# server.js を実行
CMD ["node", "server.js"]