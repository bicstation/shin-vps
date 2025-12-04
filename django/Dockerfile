# Python公式のイメージを使用
FROM python:3.11-slim

# OSの依存関係をインストール（psycopg2に必要なライブラリ）
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /usr/src/app

# requirements.txtをコピーし、パッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Djangoプロジェクトのコード全体をコンテナにコピー
# ※ この時点でプロジェクトコードはまだ存在しない可能性がありますが、
#   デプロイ時にこのディレクトリに配置されることを想定しています。
COPY . .

# Djangoのデフォルトポート（Gunicornで使用）
EXPOSE 8000

# コンテナ起動時にGunicornを起動
# docker-compose.ymlで上書きされるため、ここは基本的な定義のみ
CMD ["gunicorn", "your_project.wsgi:application", "--bind", "0.0.0.0:8000"]