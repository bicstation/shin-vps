#!/bin/sh
# Python公式のイメージを使用
FROM python:3.11-slim

# OSの依存関係をインストール（psycopg2に必要なライブラリとncコマンド）
# --- 変更箇所: netcat-openbsd を追加しました ---
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*
# --------------------------------------------------

# 作業ディレクトリの設定
WORKDIR /usr/src/app

# requirements.txtをコピーし、パッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Djangoプロジェクトのコード全体をコンテナにコピー
COPY . .

# --------------------------------------------
# 🎯 追記する重要な行: entrypoint.sh に実行権限を付与
RUN chmod +x /usr/src/app/entrypoint.sh
# --------------------------------------------

# Djangoのデフォルトポート（Gunicornで使用）
EXPOSE 8000

# コンテナ起動時にGunicornを起動
CMD ["gunicorn", "your_project.wsgi:application", "--bind", "0.0.0.0:8000"]