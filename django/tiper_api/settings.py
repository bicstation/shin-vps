# -*- coding: utf-8 -*-
"""
Django settings for tiper_api project.

💡 SHIN-VPS 統合開発環境用【最終確定・全ドメイン網羅版】
- tiper.live, bicstation.com, bic-saving.com, avflash.xyz および全サブドメイン対応
- Traefik リバースプロキシ (HTTPS) 整合性設定済み
- ローカル (HTTP) / 本番 (HTTPS) 自動切り替え
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

# 💡 本番環境では環境変数 DEBUG=False を設定することを推奨
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# ----------------------------------------------------
# 🌐 ホスト / サブドメイン設定 (全ドメインを網羅)
# ----------------------------------------------------
ALLOWED_HOSTS = [
    # --- tiper.live グループ ---
    'tiper.live', 
    'api.tiper.live', 
    'blog.tiper.live', 
    'phpmyadmin.tiper.live', 
    'pgadmin.tiper.live', 
    'logs.tiper.live',
    
    # --- bicstation.com グループ ---
    'bicstation.com',
    'blog.bicstation.com',
    
    # --- bic-saving.com グループ ---
    'bic-saving.com',
    'blog.bic-saving.com',
    
    # --- avflash.xyz グループ ---
    'avflash.xyz',
    'blog.avflash.xyz',

    # --- インフラ・ローカル開発用 ---
    'django-v2',
    'localhost',
    '127.0.0.1',
    'api-tiper-host', 'tiper-host', 'bicstation-host', 'saving-host', 'avflash-host',
    '*' # 予備のワイルドカード
]

# ----------------------------------------------------
# 🔗 CORS / CSRF 設定 (フロントエンド連携用)
# ----------------------------------------------------
CORS_ALLOWED_ORIGINS = [ 
    # 本番環境のメインドメイン
    "https://tiper.live", 
    "https://bicstation.com",
    "https://bic-saving.com",
    "https://avflash.xyz",
    "https://blog.tiper.live",
    "https://blog.bicstation.com",
    "https://blog.bic-saving.com",
    "https://blog.avflash.xyz",
    
    # ローカル開発環境用
    "http://localhost:3000", 
    "http://localhost:8083",
    "http://tiper-host:8083",
    "http://api-tiper-host:8083",
]

CORS_ALLOW_CREDENTIALS = True

# CSRFトークンを信頼するオリジン (サブドメインをすべて含める)
CSRF_TRUSTED_ORIGINS = [
    'https://tiper.live', 'https://api.tiper.live', 'https://blog.tiper.live',
    'https://phpmyadmin.tiper.live', 'https://pgadmin.tiper.live', 'https://logs.tiper.live',
    'https://bicstation.com', 'https://blog.bicstation.com',
    'https://bic-saving.com', 'https://blog.bic-saving.com',
    'https://avflash.xyz', 'https://blog.avflash.xyz',
    
    # ローカル開発用
    'http://localhost:3000', 
    'http://localhost:8083', 
    'http://api-tiper-host:8083',
    'http://127.0.0.1:8083', 
]

# ----------------------------------------------------
# 🛡️ Traefik リバースプロキシ設定 (重要：404/403回避用)
# ----------------------------------------------------
# これにより、Traefikが受け取った「Host」と「HTTPS」情報をDjangoが正しく解釈します
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ----------------------------------------------------
# 🍪 セッション・Cookie 設定
# ----------------------------------------------------
# 本番(HTTPS)なら Secure=True、ローカル(HTTP)なら False
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True

# ----------------------------------------------------
# アプリケーション定義
# ----------------------------------------------------
INSTALLED_APPS = [
    'corsheaders', 
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic', # 開発サーバーでもWhiteNoiseを使用
    'django.contrib.staticfiles',
    'django_filters', 
    'rest_framework', 
    'django_extensions',
    'scrapers', 
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # 最上部
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'api.middleware.DomainDiscoveryMiddleware', # 自作ミドルウェア
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
# 🗄️ データベース設定 (PostgreSQL)
# ----------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'tiper_db'),
        'USER': os.environ.get('DB_USER', 'tiper_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', '1492nabe'),
        'HOST': os.environ.get('DB_HOST', 'postgres-db-v2'),
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
# 📁 静的ファイル (WhiteNoise / STORAGES)
# ----------------------------------------------------
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ----------------------------------------------------
# 🛠️ Django REST Framework (DRF) 設定
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
    'PAGE_SIZE': 10, 
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ),
}

# ----------------------------------------------------
# 📝 ロギング設定
# ----------------------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'api_formatter': {
            'format': '[{levelname}] {asctime} ({name}): {message}',
            'style': '{', 'datefmt': '%H:%M:%S',
        },
    },
    'handlers': {
        'console': { 'class': 'logging.StreamHandler', 'formatter': 'api_formatter' },
    },
    'root': { 'handlers': ['console'], 'level': 'WARNING' },
    'loggers': {
        'django': { 'handlers': ['console'], 'level': 'INFO', 'propagate': False },
        'api': { 'handlers': ['console'], 'level': 'DEBUG', 'propagate': False },
    }
}

# ----------------------------------------------------
# 🚀 起動時 collectstatic (開発環境用便利機能)
# ----------------------------------------------------
if DEBUG and 'runserver' in sys.argv:
    import subprocess
    if not os.path.exists(STATIC_ROOT) or not os.listdir(STATIC_ROOT):
        print("🛠️ [AUTO-INFO] staticfiles not found. Running collectstatic...")
        try:
            subprocess.run([sys.executable, "manage.py", "collectstatic", "--noinput"], check=True)
        except Exception as e:
            print(f"⚠️ [AUTO-ERROR] Failed: {e}")
                
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000