FROM node:18-slim AS builder 

ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# 1. パッケージインストール
COPY next-tiper/package*.json ./
RUN npm install

# 2. プロジェクト本体と shared のコピー
COPY next-tiper/ ./
COPY shared ./shared

# 💡 物理ファイルが存在するか最終確認
RUN ls -l ./shared/components/lib/auth.ts || ls -l ./shared/components/lib/auth.tsx

# 3. ビルド実行
RUN npm run build

# --- runnerステージ ---
FROM node:18-slim AS runner 
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
RUN if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]