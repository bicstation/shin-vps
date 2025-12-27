# --- 💡 修正: ビルド時引数の受け取り ---
ARG NEXT_PUBLIC_APP_TITLE

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

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

# ----------------------------------------------------
# ✅ 3. 依存関係のインストール
# ----------------------------------------------------
COPY package.json ./
COPY package-lock.json ./

# --include=optional を付けることで、そのOS（Linux）用の高速化バイナリを確実に取得します
RUN npm install --include=optional

# ビルド引数を環境変数にマッピング
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

# ----------------------------------------------------
# ✅ 4. 本番ビルドの実行
# ----------------------------------------------------
COPY . .
RUN npm run build

# --- ステージ 2: プロダクションステージ ---
FROM node:18-slim AS runner 

RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true
WORKDIR /app

# 実行環境にも最低限必要なライブラリを追加
RUN apt-get update || true && \
    apt-get install -y libc6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ビルド成果物のコピー（所有権を nextjs ユーザーに変更して安全性を高める）
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# 設定ファイルは .mjs / .js / .ts の可能性があるためワイルドカードで対応
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./

# Node.jsの環境設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]