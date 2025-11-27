# Base Strapi imageを、Strapiで推奨される現行のNode.js LTSバージョンに変更
FROM node:20-slim

# OSのパッケージを更新し、PostgreSQLクライアントビルドに必要な依存関係をインストール
# libpq-dev (PostgreSQLヘッダー), python3, make, g++ (ビルドツール)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Strapiプロジェクトのセットアップ
WORKDIR /opt/app

# 1. 依存関係のファイルのみコピー
COPY package.json package-lock.json ./

# 2. npm installを実行 (このステップで node_modulesが/opt/app/node_modulesに生成される)
RUN npm install

# 3. 残りのStrapiプロジェクトファイルをコピー (設定ファイル plugins.ts を含む)
COPY . .

# 4. 🚨 【重要: 新規追加】本番モードで起動する前に、管理画面のアセットをビルドする
#    これにより、PUBLIC_URLやADMIN_PATHの設定が反映され、起動時のエラーや404を防ぎます。
RUN npm run build

# Strapiを起動
# docker-compose.ymlで command: npm run start に上書きしているため、このCMDは削除またはコメントアウト
# CMD ["npm", "run", "develop"] 
# 👈 CMDは削除し、docker-compose.ymlの `command: npm run start` に処理を委ねる