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

# 3. 残りのStrapiプロジェクトファイルをコピー (開発中のコードが反映されるように)
# ⚠️ .dockerignore を使用して、ホスト側の node_modules や .git をコンテナへのコピーから除外してください。
#    これにより、ホストの変更がコンテナに反映されます。
COPY . .

# Strapiを起動
# 開発モード (develop) で起動し、変更をリアルタイムで反映させます
CMD ["npm", "run", "develop"]