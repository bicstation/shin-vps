# /next-xxx/Dockerfile
ARG NEXT_PUBLIC_APP_TITLE

# --- ステージ 1: ビルドステージ ---
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

COPY package.json ./
COPY package-lock.json ./

# 🛑 補足: npm install 時、プラットフォームに合ったバイナリを強制取得させる
RUN npm install --include=optional

# ARGの値をENVにマッピング
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

COPY . .

# 🛑 ステップ1の追加設定: Turbopackのエラーを避けるため、念のため環境変数を付与
# (もしpackage.jsonのbuildに--turboがついている場合の対策)
RUN npm run build

# --- ステージ 2: プロダクション (本番実行) ステージ ---
FROM node:20-slim AS runner 

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

WORKDIR /app

# 実行時にも最低限必要なライブラリを追加
RUN apt-get update && apt-get install -y \
    libc6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
# ファイル名が.mjsか.jsかプロジェクトに合わせて確認してください
COPY --from=builder /app/next.config.* ./ 

ENV LANG=C.UTF-8
ENV NODE_ENV=production

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]