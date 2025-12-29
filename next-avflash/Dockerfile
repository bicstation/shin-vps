# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

WORKDIR /app

# ✅ APT リポジトリの修正（ビルドステージ用：404エラー対策）
# 1. すべてのリポジトリを一旦日本ミラー(ftp.jp)に向けます
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list

# 2. セキュリティリポジトリは日本ミラー側にパスが存在しないことが多いため、公式(deb.debian.org)に強制固定します
RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm ci --include=optional

# ビルド引数の受け取り
ARG NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

# ソースコードのコピー
COPY . .

# ビルド実行（output: 'standalone' が設定されている前提）
RUN npm run build

# --- ステージ 2: プロダクション (本番実行) ステージ ---
FROM node:20-slim AS runner 

WORKDIR /app

# 実行ユーザーの定義
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ✅ APT リポジトリの修正（ランナーステージ用：ここでエラーが発生していたため修正）
# ビルドステージと同様に、ミラー設定後にセキュリティを公式に戻す処理を徹底します
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

RUN sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|ftp.jp.debian.org/debian-security|deb.debian.org/debian-security|g' /etc/apt/sources.list || true

# 本番実行に必要なライブラリをインストール
RUN apt-get update && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Standalone モードの成果物をコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# スタンドアロン実行
CMD ["node", "server.js"]