# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_API_URL

# 🚀 パスを強制的に空にし、ビルド時に「/」用としてJSを焼く
ENV NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのインストール
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update && apt-get install -y libc6 libstdc++6 && apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ ファイルのコピー
COPY next-bicstation/ ./
RUN rm -rf ./shared
COPY shared/ ./shared/

# ✅ 依存関係のインストール
RUN npm cache clean --force
RUN npm install --include=optional

# ✅ ビルド実行
RUN rm -rf .next .cache node_modules/.cache
RUN npm run build

# --- ステージ 2: プロダクションステージ ---
FROM node:18-slim AS runner 
WORKDIR /app

RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000
ENV NEXT_PUBLIC_BASE_PATH=""

# 💡 standalone モードの成果物をコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 🚀 【重要】特定のフォルダ名（next-bicstation等）に依存せず、
# 中身をすべてルートに展開して、/ 直下で動くように強制する
RUN cp -r .next/standalone/* . 2>/dev/null || true
# 不要になったサブフォルダを削除（混乱を防ぐ）
RUN rm -rf ./next-bicstation ./next-tiper ./next-bic-saving ./next-avflash

# staticファイルをコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js を実行して起動
CMD ["node", "server.js"]