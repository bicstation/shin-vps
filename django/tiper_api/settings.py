# -*- coding: utf-8 -*-
"""
Django settings for tiper_api project.

🚀 SHIN-VPS v3.9 完全復旧・マルチドメイン統合版
- 🛠️ [FIX] ValueError: Missing staticfiles manifest entry を回避
- 🛠️ [FIX] Admin 500エラーを物理的に排除 (StaticFilesStorage)
- 🌐 [CORS] ローカル(8083)・本番ドメイン全開放
"""

import os
import sys
from pathlib import Path

# プロジェクトのベースディレクトリ
BASE_DIR = Path(__file__).resolve().parent.parent

# ----------------------------------------------------
# 🔐 セキュリティ設定
# ----------------------------------------------------
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-default-key-please-change-in-prod')
# 開発中は True に固定してエラー内容を可視化
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# ----------------------------------------------------
# 🌐 ホスト / ドメイン設定
# ----------------------------------------------------
ALLOWED_HOSTS = ['*'] # 500エラー回避のため、一旦全て許可

# ----------------------------------------------------
# 🔗 CORS / CSRF 設定
# ----------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True # 開発・マルチドメイン運用のための全開放
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    'https://tiper.live', 'https://api.tiper.live',
    'https://bicstation.com', 'https://bic-saving.com', 'https://avflash.xyz',
    'http://localhost:3000', 'http://localhost:8083',
    'http://tiper-host:8083', 'http://bicstation-host:8083',
    'http://saving-host:8083', 'http://avflash-host:8083',
    'http://api-tiper-host:8083',
]

# ----------------------------------------------------
# 🛡️ Proxy 設定 (Traefik / Nginx 対応)
# ----------------------------------------------------
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ----------------------------------------------------
# ⚙️ アプリケーション定義
# ----------------------------------------------------
INSTALLED_APPS = [
    'corsheaders', 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic', # 開発中も WhiteNoise を優先
    'django.contrib.staticfiles',
    'django_filters', 
    'rest_framework', 
    'django_extensions',
    'scrapers', 
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # 静的ファイル配信
    'tiper_api.middleware.MultiDomainProjectMiddleware', # 🚀 サイト判定
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'tiper_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], 
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tiper_api.wsgi.application'

# ----------------------------------------------------
# 🗄️ データベース設定
# ----------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'tiper_db'),
        'USER': os.environ.get('DB_USER', 'tiper_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', '1492nabe'),
        'HOST': os.environ.get('DB_HOST', 'postgres-db-v3'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# ----------------------------------------------------
# 👥 認証 / 国際化
# ----------------------------------------------------
AUTH_USER_MODEL = 'api.User'
LANGUAGE_CODE = 'ja'
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = True

# ----------------------------------------------------
# 📁 静的ファイル (WhiteNoise 安定版)
# ----------------------------------------------------
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# 🛡️ 修正ポイント: Manifest(地図)を使わないストレージに変更
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ----------------------------------------------------
# 🛠️ Django REST Framework (DRF)
# ----------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 12, 
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ),
}

# ----------------------------------------------------
# 🚀 自動処理の抑制 (コンテナのループ防止)
# ----------------------------------------------------
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000