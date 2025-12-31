# 💡 最初のステージよりも前に ARG を定義し、ビルド全体で参照可能にします
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# 💡 ビルド時に必要な環境変数を再度定義
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

WORKDIR /app

# ✅ リポジトリ設定の修正（ビルドステージ用）
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm install --include=optional

# 全ソースコードのコピー
COPY . .

# ビルド実行（next.config.mjs で output: 'standalone' が設定されている前提）
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:20-slim AS runner

WORKDIR /app

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# ✅ 実行環境のリポジトリ修正
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 本番実行に必要な最小限のライブラリ
RUN apt-get update && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# ✅ 重要: standalone モード専用のコピー設定
# 1. 公開フォルダ
COPY --from=builder /app/public ./public
# 2. 本体
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 3. 標準の static フォルダ
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. 💡 404対策のダメ押し：
# basePath 設定時に Next.js が内部で参照する standalone 構造の階層にも static を配置
RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true

# 実行ユーザーの切り替え
USER nextjs
EXPOSE 3000

# Standalone モードの実行
CMD ["node", "server.js"]