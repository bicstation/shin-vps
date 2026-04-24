# -*- coding: utf-8 -*-
"""
Django settings for tiper_api project.
🚀 SHIN-VPS v3.9.2 完全復旧・マルチドメイン統合版
修正内容: シリーズ構成用JSONパスの追加（management/commands配下）、CSRF信頼ドメインの厳格化
"""

import os
from pathlib import Path

# --- 📁 ディレクトリ設定 ---
# BASE_DIR は /home/maya/shin-dev/shin-vps/django/ を指す
BASE_DIR = Path(__file__).resolve().parent.parent

# --- 🔐 セキュリティ設定 ---
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-default-key-please-change-in-prod')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# --- 🌐 ホスト / ドメイン設定 ---
ALLOWED_HOSTS = ['*']

# --- 🔗 CORS / CSRF 設定 ---
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    # 本番ドメイン
    'https://tiper.live', 'https://api.tiper.live',
    'https://bicstation.com', 'https://api.bicstation.com',
    'https://bic-saving.com', 'https://api.bic-saving.com',
    'https://avflash.xyz', 'https://api.avflash.xyz',
    
    # ローカル・デバッグ環境
    'http://localhost:3000', 'http://localhost:8083',
    'http://127.0.0.1:3000', 'http://127.0.0.1:8083',

    # 🛰️ 内部Dockerネットワーク通信
    'http://tiper-host', 'http://tiper-host:8083',
    'http://bicstation-host', 'http://bicstation-host:8083',
    'http://saving-host', 'http://saving-host:8083',
    'http://avflash-host', 'http://avflash-host:8083',
    
    # 🛰️ API用識別子
    'http://api-tiper-host', 'http://api-tiper-host:8083',
    'http://api-bicstation-host', 'http://api-bicstation-host:8083',
    'http://api-saving-host', 'http://api-saving-host:8083',
    'http://api-avflash-host', 'http://api-avflash-host:8083',
]

# --- 🛡️ Proxy 設定 ---
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# --- ⚙️ アプリケーション定義 ---
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
    'tiper_api.middleware.MultiDomainProjectMiddleware',
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

# --- 🗄️ データベース設定 ---
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

# --- 👥 認証 / 国際化 ---
AUTH_USER_MODEL = 'api.User'
LANGUAGE_CODE = 'ja'
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = True

# --- 📁 静的ファイル ---
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# --- 📁 メディアファイル（追加） ---
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- 🛠️ Django REST Framework ---
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
}

DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000

# --- 🛰️ シリーズ記事生成エンジンのための追加設定 ---
# 指定されたパス: /home/maya/shin-dev/shin-vps/django/api/management/commands/content_data/series_config.json
SERIES_CONFIG_PATH = os.path.join(
    BASE_DIR, 
    'api', 
    'management', 
    'commands', 
    'content_data', 
    'series_config.json'
)