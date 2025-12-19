# 現行安定版のbookwormを明示的に使用
FROM python:3.11-slim-bookworm

# OSの依存関係をインストール
# --allow-releaseinfo-change はリポジトリの状態が変わっていても強制更新するフラグです
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    curl \
    # --- Playwright用の依存ライブラリ群 ---
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /usr/src/app

# requirements.txtをコピーし、パッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Playwright本体とChromiumブラウザのインストール ---
RUN pip install playwright && \
    playwright install chromium && \
    playwright install-deps chromium

# Djangoプロジェクトのコード全体をコンテナにコピー
COPY . .

# entrypoint.sh に実行権限を付与
RUN chmod +x /usr/src/app/entrypoint.sh

# Djangoのデフォルトポート
EXPOSE 8000

# CMDは、ENTRYPOINTに引数として渡されます
CMD ["gunicorn", "tiper_api.wsgi:application", "--bind", "0.0.0.0:8000"]