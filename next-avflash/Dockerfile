ARG NEXT_PUBLIC_APP_TITLE

# --- ステージ 1: ビルドステージ ---
# 🛑 修正 1: node:18-slim から node:20-slim へバージョンアップ (互換性向上目的)
FROM node:20-slim AS builder 

# 実行ユーザーの定義 (node:slim は Debian ベース)
RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true
WORKDIR /app
# --- ここに追加！ ---
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list
# ------------------
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# ----------------------------------------------------
# 最終修正: ARG の値を ENV にマッピング (Next.jsビルド用)
# ----------------------------------------------------
# ARGで受け取った変数を、ビルド時にNext.jsが読み取れる環境変数として設定する
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
# ----------------------------------------------------

# ----------------------------------------------------
# 🛑 修正 2: Debian/Ubuntu (slim) 用の日本語フォントインストールを RUN 1行に集約
# ----------------------------------------------------

# パッケージリストを更新し、日本語フォントをインストール後、キャッシュをクリーンアップ
RUN apt-get update || true \
    && apt-get install -y fonts-ipafont-gothic \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------------------------------
# ----------------------------------------------------
COPY . .
RUN npm run build

# --- ステージ 2: プロダクション (本番実行) ステージ ---
# 🛑 修正 3: node:18-slim から node:20-slim へバージョンアップ
FROM node:20-slim AS runner 

# 実行ユーザーの定義 (builderステージと同じuid/gidを使用)
RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# ----------------------------------------------------
# Node.jsのエンコーディングをUTF-8に設定
# ----------------------------------------------------
ENV LANG=C.UTF-8

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]