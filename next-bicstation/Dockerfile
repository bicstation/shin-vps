# 💡 最初のステージよりも前に ARG を定義することで、ビルド全体で参照可能にします
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

# 💡 ビルド時に必要な環境変数を定義
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

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

# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm install --include=optional

# ソースコードをコピーしてビルド実行
COPY . .
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

# 3. 💡 重要：静的ファイルの配置修正
# Next.js の server.js は、.next/static を参照します。
# standalone モードでは、実行ディレクトリの .next/static を手動で用意する必要があります。
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. 💡 basePath 対策のダメ押し：
# 一部の Next.js バージョンでは、static 内でも basePath 名の階層を期待することがあります。
# そのため、static を standalone 構造内部にもコピーします。
RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true

USER nextjs
EXPOSE 3000

# server.js を実行
CMD ["node", "server.js"]