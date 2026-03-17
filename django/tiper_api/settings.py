# -*- coding: utf-8 -*-
"""
Django settings for tiper_api project.

🛡️ SHIN-VPS v3.6 最終完全統合版 (Workplace/Home Sync)
- 🚀 blog.*** および phpmyadmin サブドメインを完全に排除
- 🚀 自宅PC (ポート8083) および本番環境 (HTTPS) の両方に対応
- 🚀 Traefik リバースプロキシ整合性設定済み
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
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# ----------------------------------------------------
# 🌐 ホスト / ドメイン設定 (冗長なサブドメインを排除・ポート8083対応)
# ----------------------------------------------------
ALLOWED_HOSTS = [
    # --- 本番ドメイン (サブドメインは api / 管理用のみ維持) ---
    'tiper.live', 'api.tiper.live', 
    'bicstation.com', 
    'bic-saving.com', 
    'avflash.xyz',

    # --- インフラ・管理ツール (phpmyadminは排除) ---
    'pgadmin.tiper.live', 'logs.tiper.live',
    'django-v3',
    'localhost',
    '127.0.0.1',

    # --- ローカル開発用ドメイン (ポート8083付きを網羅) ---
    'tiper-host', 'tiper-host:8083',
    'bicstation-host', 'bicstation-host:8083',
    'saving-host', 'saving-host:8083',
    'avflash-host', 'avflash-host:8083',
    'api-tiper-host', 'api-tiper-host:8083',
    
    '*' # 安全策としてのワイルドカード
]

# ----------------------------------------------------
# 🔗 CORS / CSRF 設定 (フロントエンド連携用)
# ----------------------------------------------------
CORS_ALLOWED_ORIGINS = [ 
    # 本番環境
    "https://tiper.live", "https://bicstation.com", "https://bic-saving.com", "https://avflash.xyz",
    
    # ローカル開発環境 (Next.js サーバーサイド/クライアントサイド両対応)
    "http://localhost:3000", 
    "http://localhost:8083",
    "http://tiper-host:8083",
    "http://bicstation-host:8083",
    "http://saving-host:8083",
    "http://avflash-host:8083",
    "http://api-tiper-host:8083",
]

CORS_ALLOW_CREDENTIALS = True

# CSRFトークンを信頼するオリジン (プロトコル必須、不要なサブドメインは排除済)
CSRF_TRUSTED_ORIGINS = [
    'https://tiper.live', 'https://api.tiper.live',
    'https://pgadmin.tiper.live', 'https://logs.tiper.live',
    'https://bicstation.com', 
    'https://bic-saving.com', 
    'https://avflash.xyz',
    
    # ローカル開発用
    'http://localhost:3000', 
    'http://localhost:8083', 
    'http://tiper-host:8083',
    'http://bicstation-host:8083',
    'http://saving-host:8083',
    'http://avflash-host:8083',
    'http://api-tiper-host:8083',
    'http://127.0.0.1:8083', 
]

# ----------------------------------------------------
# 🛡️ Traefik リバースプロキシ設定
# ----------------------------------------------------
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ----------------------------------------------------
# 🍪 セッション・Cookie 設定
# ----------------------------------------------------
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
    'whitenoise.runserver_nostatic', 
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
    'whitenoise.middleware.WhiteNoiseMiddleware',
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
# 🗄️ データベース設定 (PostgreSQL)
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
# 🔑 外部API認証情報 (DUGA / FANZA)
# ----------------------------------------------------
API_CONFIG = {
    'DUGA': {
        'API_ID': os.environ.get('DUGA_API_ID'),
        'API_KEY': os.environ.get('DUGA_AFFILIATE_ID'),
        'API_URL': 'http://affapi.duga.jp/search',
    },
    'FANZA': {
        'API_ID': os.environ.get('FANZA_API_ID'),
        'API_KEY': os.environ.get('FANZA_AFFILIATE_ID'),
        'API_URL': 'https://api.dmm.com/affiliate/v3/ItemList',
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
# 📁 静的ファイル (WhiteNoise)
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
# 🚀 起動時 collectstatic (開発環境用)
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