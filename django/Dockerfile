# =====================================================================
# 🚀 SHIN CORE LINX｜Django 共通 Dockerfile
# FINAL STABLE MONOREPO RUNTIME EDITION
# =====================================================================

# =====================================================================
# Base Image
# =====================================================================
FROM python:3.11-slim-bookworm

# =====================================================================
# Python Environment
# =====================================================================
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# =====================================================================
# Work Directory
# =====================================================================
WORKDIR /usr/src/app

# =====================================================================
# System Packages
# =====================================================================
RUN apt-get update --allow-releaseinfo-change && \
    apt-get install -y \
    libpq-dev \
    gcc \
    g++ \
    build-essential \
    netcat-openbsd \
    curl \
    wget \
    git \
    gnupg \
    pkg-config \
    libcairo2 \
    libcairo2-dev \
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
    libasound2 \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei && \
    rm -rf /var/lib/apt/lists/*

# =====================================================================
# Python Requirements
# monorepo root context architecture
# =====================================================================
COPY django/requirements.txt ./requirements.txt

# =====================================================================
# Python Install
# =====================================================================
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# =====================================================================
# Playwright Runtime
# =====================================================================
RUN pip install playwright && \
    playwright install chromium && \
    playwright install-deps chromium

# =====================================================================
# Shared Semantic Layer
# =====================================================================
COPY shared/ ./shared/

# =====================================================================
# Django Source
# IMPORTANT:
# build.context: ./
# =====================================================================
COPY django/ ./

# =====================================================================
# Cleanup Cache
# =====================================================================
RUN find . -name "*.pyc" -delete && \
    find . -name "__pycache__" -type d -exec rm -rf {} + || true

# =====================================================================
# Entrypoint
# =====================================================================
RUN chmod +x /usr/src/app/entrypoint.sh

# =====================================================================
# Static / Media
# =====================================================================
RUN mkdir -p /usr/src/app/staticfiles && \
    mkdir -p /usr/src/app/media

# =====================================================================
# Port
# =====================================================================
EXPOSE 8000

# =====================================================================
# Start
# =====================================================================
CMD ["gunicorn", "tiper_api.wsgi:application", "--bind", "0.0.0.0:8000"]