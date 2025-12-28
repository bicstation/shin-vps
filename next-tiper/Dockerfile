# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 
WORKDIR /app

# リポジトリ設定（日本ミラー）
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources || \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list

RUN apt-get update && apt-get install -y libc6 libstdc++6 && apt-get clean && rm -rf /var/lib/apt/lists/*

# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm install --include=optional

# ビルド実行
COPY . .
RUN npm run build

# --- ステージ 2: プロダクションステージ ---
FROM node:18-slim AS runner 

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
WORKDIR /app

RUN apt-get update || true && apt-get install -y libc6 && apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ standalone モードの正しい配置
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]