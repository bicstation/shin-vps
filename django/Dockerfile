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
# 🎯 追記する重要な行: entrypoint.sh に実行権限を付与 (既に存在しますが、再確認のため残します)
RUN chmod +x /usr/src/app/entrypoint.sh
# --------------------------------------------

# Djangoのデフォルトポート（Gunicornで使用）
EXPOSE 8000

# --------------------------------------------
# 🚨 修正箇所: entrypoint.sh を ENTRYPOINT に設定
# CMDの権限エラーを回避し、entrypoint.shをメインプロセスとして確実に起動させます。
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# CMDは、ENTRYPOINTに引数として渡されます ($@ に展開される)
# Gunicornの起動は、entrypoint.shのスクリプト内で最終的に 'exec "$@"' によって実行される前提とします。
CMD ["gunicorn", "your_project.wsgi:application", "--bind", "0.0.0.0:8000"]
# --------------------------------------------