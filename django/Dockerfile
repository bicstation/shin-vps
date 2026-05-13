# ==================================================================
# 🚀 SHIN-VPS Django Dockerfile (Python 3.11 / Slim Bookworm)
# ==================================================================

# 1. ベースイメージ
FROM python:3.11-slim-bookworm

# 2. Python 環境最適化
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. OS依存パッケージのインストール
RUN apt-get update --allow-releaseinfo-change && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-openbsd \
    curl \
    gnupg \
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
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    && rm -rf /var/lib/apt/lists/*

# 4. 作業ディレクトリ
WORKDIR /usr/src/app

# 5. requirements.txt をコピーしてパッケージをインストール
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Playwright と Chromium のインストール
RUN pip install --no-cache-dir playwright && \
    playwright install chromium && \
    playwright install-deps chromium

# 7. Django プロジェクト全体をコピー
COPY . .

# 8. entrypoint.sh に実行権限を付与
RUN chmod +x /usr/src/app/entrypoint.sh

# 9. Django デフォルトポート
EXPOSE 8000

# 10. 実行コマンド
CMD ["gunicorn", "tiper_api.wsgi:application", "--bind", "0.0.0.0:8000"]