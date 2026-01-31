# 💡 ビルド全体で参照可能な引数
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL

# --- ステージ 1: ビルドステージ ---
FROM node:18-slim AS builder 

ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

# ✅ リポジトリ設定の徹底修正（404エラー・セキュリティパス対策）
RUN if [ -f /etc/apt/sources.list.d/debian.sources ]; then \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list.d/debian.sources; \
    fi && \
    sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true

# セキュリティリポジトリを安定したパス（本家）へ上書き
RUN echo "deb http://deb.debian.org/debian-security bookworm-security main" > /etc/apt/sources.list.d/security.list || true

# 必要なパッケージのインストール（updateが一部失敗しても強行する）
RUN apt-get update || true
RUN apt-get install -y libc6 libstdc++6 fonts-ipafont-gothic && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 💡 物理構造のコピー（sharedとプロジェクト本体）
# 親ディレクトリにある shared を /app/shared へ、プロジェクトを /app へ
COPY shared/ ../shared/
COPY . ./

# 💡 共有ディレクトリをプロジェクト内に物理コピーし、エイリアスパスを調整
RUN rm -rf ./shared && cp -r ../shared ./shared
RUN find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|../shared/|@shared/|g' || true

# 依存関係のインストール
RUN npm cache clean --force
RUN npm install --include=optional

# 💡 ビルド実行（徹底的にクリーンアップしてから実行）
RUN rm -rf .next .cache node_modules/.cache
RUN npm run build

# --- ステージ 2: プロダクションステージ (実行環境) ---
FROM node:18-slim AS runner 

WORKDIR /app

# 実行環境でもリポジトリ修正を実施
RUN sed -i 's|http://deb.debian.org/debian|http://ftp.jp.debian.org/debian|g' /etc/apt/sources.list || true
RUN apt-get update || true && apt-get install -y libc6 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 実行ユーザーの定義
RUN addgroup --gid 1001 nodejs || true && \
    adduser --disabled-password --gecos "" --uid 1001 --gid 1001 nextjs || true

# 環境変数の設定
ENV LANG=C.UTF-8
ENV NODE_ENV=production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ Standalone モード用の成果物をコピー
# 1. 公開フォルダ
COPY --from=builder /app/public ./public

# 2. 本体（standalone フォルダの中身を直下に展開）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 3. 💡 重要：サブフォルダ（next-tiper）の中身を WORKDIR 直下に移動
# Next.jsのstandaloneビルド特有の階層構造を解消し server.js を直下に配置します
RUN if [ -d "./next-tiper" ]; then cp -r ./next-tiper/. . && rm -rf ./next-tiper; fi

# 4. 静的ファイルの配置
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 5. 💡 basePath 対策のダメ押し
RUN mkdir -p .next/static && cp -r ./static/* .next/static/ 2>/dev/null || true

USER nextjs
EXPOSE 3000

# 確実に直下の server.js を実行
CMD ["node", "server.js"]