# 💡 最初のステージよりも前に ARG を定義することで、ビルド全体で参照可能にします
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

# ✅ APT リポジトリの修正（ビルドステージ用：404エラー対策）
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
RUN npm ci --include=optional

# ソースコードのコピー
COPY . .

# ビルド実行（next.config.mjs で output: 'standalone' が設定されている前提）
RUN npm run build

# --- ステージ 2: プロダクション (本番実行) ステージ ---
FROM node:20-slim AS runner 

WORKDIR /app

# ✅ APT リポジトリの修正（ランナーステージ用）
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://ftp.jp.debian.org/debian-security|http://deb.debian.org/debian-security|g' /etc/apt/sources.list || true

RUN apt-get update && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 環境変数の設定
ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ Standalone モード用の成果物をコピー
# 1. 公開フォルダ
COPY --from=builder /app/public ./public

# 2. 本体（standalone フォルダの中身を直下に展開）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 3. 💡 重要：静的ファイルの配置修正
# server.js が参照する標準の場所に static を配置
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 4. 💡 basePath 対策：
# basePath 設定時に Next.js が探しに行く standalone 構造内部にも static を配置します
RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/ 2>/dev/null || true

USER nextjs
EXPOSE 3000

# スタンドアロン実行
CMD ["node", "server.js"]