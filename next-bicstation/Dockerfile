# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

# ビルド引数の設定
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# 作業ディレクトリの設定
WORKDIR /app

# ✅ 1. OSパッケージのインストール（ミラーサイト指定で安定化）
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update && apt-get install -y libc6 libstdc++6 && apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ 2. ファイルのコピー
# 🚨 プロジェクトファイルを先にコピー（ここに含まれる shared リンクは後で消す）
COPY next-bicstation/ ./

# 🚨 コンテナ内の不完全な shared を削除し、
#    物理構造を整えた「本物の shared フォルダ」を正しい位置（/app/shared）に配置
RUN rm -rf ./shared
COPY shared/ ./shared/

# ✅ 3. 依存関係のインストール
# node_modules などをクリーンにしてからインストールを実行
RUN npm cache clean --force
RUN npm install --include=optional

# ✅ 4. ビルド実行
# 前回のキャッシュを完全に削除してからビルドを開始
RUN rm -rf .next .cache node_modules/.cache
RUN npm run build

# --- ステージ 2: プロダクションステージ ---
FROM node:18-slim AS runner 
WORKDIR /app

# 実行ユーザーの定義（セキュリティ対応）
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# builderステージから standalone モードに必要な成果物だけをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 💡 standalone 配下のプロジェクト名ディレクトリをルートに展開
# next-bicstation ディレクトリがある場合、その中身をカレントディレクトリに移動する
RUN if [ -d "./next-bicstation" ]; then cp -r ./next-bicstation/. . && rm -rf ./next-bicstation; fi

# staticファイルをコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js を実行して起動
CMD ["node", "server.js"]