# -*- coding: utf-8 -*-
"""
Django settings for tiper_api project.
🚀 SHIN-VPS v3.9 完全復旧・マルチドメイン統合版
"""

import os
from pathlib import Path

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
    'https://tiper.live', 'https://api.tiper.live',
    'https://bicstation.com', 'https://api.bicstation.com',
    'https://bic-saving.com', 'https://api.bic-saving.com',
    'https://avflash.xyz', 'https://api.avflash.xyz',
    'http://localhost:3000', 'http://localhost:8083',
    'http://tiper-host:8083', 'http://bicstation-host:8083',
    'http://saving-host:8083', 'http://avflash-host:8083',
    'http://api-tiper-host:8083', 'http://api-bicstation-host:8083',
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