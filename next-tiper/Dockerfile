# --- 💡 修正: ビルド時引数の受け取り ---
ARG NEXT_PUBLIC_APP_TITLE

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true
WORKDIR /app

# ----------------------------------------------------
# ✅ 【重要】ここに追加：日本のミラーサーバーに変更
# ----------------------------------------------------
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list
# ----------------------------------------------------

COPY package.json ./
COPY package-lock.json ./
RUN npm install

ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE

# ----------------------------------------------------
# ✅ 【重要】修正：|| true を入れてエラー落ちを防ぎ、1行にまとめる
# ----------------------------------------------------
RUN apt-get update || true && \
    apt-get install -y fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# ----------------------------------------------------

COPY . .
RUN npm run build

# --- ステージ 2: プロダクションステージ ---
FROM node:18-slim AS runner 

# (以下、元のコードと同じ)
RUN addgroup --gid 1001 nodejs || true
RUN adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

ENV LANG=C.UTF-8

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]