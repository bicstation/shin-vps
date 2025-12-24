# 現行安定版のbookwormを明示的に使用
FROM python:3.11-slim-bookworm

# 1. 環境変数の設定 (Pythonの動作を最適化)
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 2. OSの依存関係をインストール
# --allow-releaseinfo-change を含め、PlaywrightとPostgreSQLに必要なライブラリを網羅
RUN apt-get update --allow-releaseinfo-change && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    curl \
    gnupg \
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
    # 日本語フォント (スクレイピング時の文字化け防止)
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    && rm -rf /var/lib/apt/lists/*

# 3. 作業ディレクトリの設定
WORKDIR /usr/src/app

# 4. requirements.txtをコピーし、パッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 5. Playwright本体とChromiumブラウザのインストール
# install-deps を実行することで、ブラウザ実行に必要なOSライブラリを最終確定させます
RUN pip install --no-cache-dir playwright && \
    playwright install chromium && \
    playwright install-deps chromium

# 6. Djangoプロジェクトのコード全体をコンテナにコピー
COPY . .

# 7. entrypoint.sh に実行権限を付与
RUN chmod +x /usr/src/app/entrypoint.sh

# 8. Djangoのデフォルトポート
EXPOSE 8000

# 9. 実行コマンド
# ENTRYPOINTがある場合はその引数として、ない場合は直接実行されます
CMD ["gunicorn", "tiper_api.wsgi:application", "--bind", "0.0.0.0:8000"]