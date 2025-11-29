# --- ステージ 1: ビルドステージ (依存関係のインストールと本番ビルド) ---
FROM node:20-alpine AS builder

# 実行ユーザーの定義
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 作業ディレクトリ
WORKDIR /app

# ★ 修正: docker-compose.ymlから渡されるビルド引数を受け取る
ARG NEXT_PUBLIC_APP_TITLE

# ★ 修正: ビルド時に使用できるよう、環境変数として設定
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

# package.json と package-lock.json をコピーして依存関係をインストール
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# アプリケーションコードをコピー
COPY . .

# SSG/SSRのための本番ビルドを実行
# Next.jsはここでDjango APIにアクセスしてデータを取得します
RUN npm run build

# --- ステージ 2: プロダクション (本番実行) ステージ ---
FROM node:20-alpine AS runner

# 実行ユーザーの定義
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 作業ディレクトリ
WORKDIR /app

# ビルドステージから必要なファイルをコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# 静的コンテンツを配信するためのユーザーに変更
USER nextjs

# ビルドしたアプリケーションを起動
EXPOSE 3000
CMD ["npm", "start"]