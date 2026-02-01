# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ ---
FROM node:20-slim AS builder 

# ビルド引数の設定
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ OSパッケージのセットアップ（404エラー対策済み）
RUN sed -i 's|http://deb.debian.org/debian |http://ftp.jp.debian.org/debian |g' /etc/apt/sources.list || true
RUN echo "deb http://security.debian.org/debian-security bookworm-security main" > /etc/apt/sources.list.d/security.list

RUN apt-get update && \
    apt-get install -y --no-install-recommends libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ 1. ファイルの物理コピー
# アプリ本体を先にコピー
COPY next-bic-saving/ ./
# リンク切れの可能性があるディレクトリを掃除
RUN rm -rf ./shared

# sharedフォルダを実体としてコピー
COPY shared/ ./shared/

# ✅ 2. 依存関係のインストール
RUN npm cache clean --force
RUN npm install --include=optional

# ✅ 3. ビルド実行
# 前回のキャッシュを削除してクリーンビルド
RUN rm -rf .next .cache node_modules/.cache
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:20-slim AS runner

WORKDIR /app

# 実行環境のOSパッケージ調整
RUN apt-get update && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# ✅ 成果物の配置 (standaloneモード用)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 💡 standalone配下のプロジェクト名ディレクトリをルートに展開
RUN if [ -d "./next-bic-saving" ]; then cp -r ./next-bic-saving/. . && rm -rf ./next-bic-saving; fi

# 静的ファイルのコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]