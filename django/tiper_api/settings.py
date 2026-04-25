# -*- coding: utf-8 -*-
"""
Django settings for tiper_api project
🚀 JWT認証統一版（セッション廃止設計）
"""

import os
from pathlib import Path
from datetime import timedelta

# ==========================================================
# 📁 ディレクトリ設定
# ==========================================================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================================
# 🔐 セキュリティ設定
# ==========================================================
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-change-me')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# ==========================================================
# 🌐 ホスト設定
# ==========================================================
ALLOWED_HOSTS = ['*']

# ==========================================================
# 🔗 CORS / CSRF（JWTではcookie使わないので簡略化）
# ==========================================================
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = False  # ← JWTなのでFalseにする

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8083',
]

# ==========================================================
# 🛡️ Proxy設定（Traefik対応）
# ==========================================================
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ==========================================================
# ⚙️ アプリケーション
# ==========================================================
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    # ❌ セッションはJWTでは不要だが管理画面用に残してOK
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'django_filters',
    'django_extensions',

    'scrapers',
    'api.apps.ApiConfig',
]

# ==========================================================
# 🔧 ミドルウェア
# ==========================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',

    # ❌ セッション依存しないが管理画面のため残す
    'django.contrib.sessions.middleware.SessionMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==========================================================
# 📡 URL / WSGI
# ==========================================================
ROOT_URLCONF = 'tiper_api.urls'
WSGI_APPLICATION = 'tiper_api.wsgi.application'

# ==========================================================
# 🗄️ DB設定
# ==========================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'tiper_db'),
        'USER': os.environ.get('DB_USER', 'tiper_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'postgres-db-v3'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# ==========================================================
# 👤 ユーザー設定
# ==========================================================
AUTH_USER_MODEL = 'api.User'

# ==========================================================
# 🌍 言語 / 時間
# ==========================================================
LANGUAGE_CODE = 'ja'
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = True

# ==========================================================
# 📁 静的 / メディア
# ==========================================================
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# ==========================================================
# 🚀 DRF設定（JWT認証に統一）
# ==========================================================
REST_FRAMEWORK = {
    # 🔥 ここが最重要（JWTに統一）
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    # 基本はログイン必須（API設計的に正しい）
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# ==========================================================
# 🔑 JWT設定（ここも重要）
# ==========================================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ==========================================================
# ⚙️ その他
# ==========================================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000