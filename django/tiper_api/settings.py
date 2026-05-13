# -*- coding: utf-8 -*-
"""
==============================================================================
🚀 Django Settings for tiper_api
==============================================================================

SHIN CORE LINX
JWT Unified Architecture Edition

Responsibilities:
    - Multi-Domain API Backend
    - Semantic API Authority
    - JWT Authentication
    - Traefik / Docker Support
    - Next.js SSR Support

==============================================================================
"""

import os

from pathlib import Path

from datetime import timedelta


# ==============================================================================
# 📁 BASE DIRECTORY
# ==============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ==============================================================================
# 🔐 SECURITY
# ==============================================================================

SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-change-me'
)

# 🚀 Productionでは env 管理推奨
DEBUG = os.environ.get(
    'DEBUG',
    'True'
) == 'True'


# ==============================================================================
# 🌐 HOSTS
# ==============================================================================

ALLOWED_HOSTS = ['*']


# ==============================================================================
# 🔗 CORS / CSRF
# ==============================================================================

CORS_ALLOW_ALL_ORIGINS = True

# JWT ONLY
CORS_ALLOW_CREDENTIALS = False


CSRF_TRUSTED_ORIGINS = [

    'http://localhost:3000',

    'http://localhost:8083',

    'http://bicstation.com:8083',

    'http://api.bicstation.com:8083',
]


# ==============================================================================
# 🛡️ PROXY / TRAEFIK
# ==============================================================================

USE_X_FORWARDED_HOST = True

SECURE_PROXY_SSL_HEADER = (
    'HTTP_X_FORWARDED_PROTO',
    'https'
)


# ==============================================================================
# 🚀 INSTALLED APPS
# ==============================================================================

INSTALLED_APPS = [

    # --------------------------------------------------------------------------
    # CORS
    # --------------------------------------------------------------------------

    'corsheaders',

    # --------------------------------------------------------------------------
    # Django Core
    # --------------------------------------------------------------------------

    'django.contrib.admin',

    'django.contrib.auth',

    'django.contrib.contenttypes',

    'django.contrib.sessions',

    'django.contrib.messages',

    'django.contrib.staticfiles',

    # --------------------------------------------------------------------------
    # DRF
    # --------------------------------------------------------------------------

    'rest_framework',

    'django_filters',

    'django_extensions',

    # --------------------------------------------------------------------------
    # SHIN CORE LINX
    # --------------------------------------------------------------------------

    'scrapers',

    'api.apps.ApiConfig',
]


# ==============================================================================
# 🧩 TEMPLATES
# ==============================================================================

TEMPLATES = [

    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',

        'DIRS': [],

        'APP_DIRS': True,

        'OPTIONS': {

            'context_processors': [

                'django.template.context_processors.debug',

                'django.template.context_processors.request',

                'django.contrib.auth.context_processors.auth',

                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ==============================================================================
# 🚀 MIDDLEWARE
# ==============================================================================

MIDDLEWARE = [

    # --------------------------------------------------------------------------
    # 🌐 Multi-Domain Identity Layer
    # --------------------------------------------------------------------------

    'tiper_api.middleware.MultiDomainProjectMiddleware',

    # --------------------------------------------------------------------------
    # CORS
    # --------------------------------------------------------------------------

    'corsheaders.middleware.CorsMiddleware',

    # --------------------------------------------------------------------------
    # Django Security
    # --------------------------------------------------------------------------

    'django.middleware.security.SecurityMiddleware',

    # --------------------------------------------------------------------------
    # Sessions
    # --------------------------------------------------------------------------

    'django.contrib.sessions.middleware.SessionMiddleware',

    # --------------------------------------------------------------------------
    # Common
    # --------------------------------------------------------------------------

    'django.middleware.common.CommonMiddleware',

    # --------------------------------------------------------------------------
    # CSRF
    # --------------------------------------------------------------------------

    'django.middleware.csrf.CsrfViewMiddleware',

    # --------------------------------------------------------------------------
    # Authentication
    # --------------------------------------------------------------------------

    'django.contrib.auth.middleware.AuthenticationMiddleware',

    # --------------------------------------------------------------------------
    # Messages
    # --------------------------------------------------------------------------

    'django.contrib.messages.middleware.MessageMiddleware',

    # --------------------------------------------------------------------------
    # Clickjacking
    # --------------------------------------------------------------------------

    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ==============================================================================
# 📡 URL / WSGI
# ==============================================================================

ROOT_URLCONF = 'tiper_api.urls'

WSGI_APPLICATION = 'tiper_api.wsgi.application'


# ==============================================================================
# 🗄️ DATABASE
# ==============================================================================

DATABASES = {

    'default': {

        'ENGINE': 'django.db.backends.postgresql',

        'NAME': os.environ.get(
            'DB_NAME',
            'tiper_db'
        ),

        'USER': os.environ.get(
            'DB_USER',
            'tiper_user'
        ),

        'PASSWORD': os.environ.get(
            'DB_PASSWORD',
            ''
        ),

        'HOST': os.environ.get(
            'DB_HOST',
            'postgres-db-v3'
        ),

        'PORT': os.environ.get(
            'DB_PORT',
            '5432'
        ),
    }
}


# ==============================================================================
# 👤 AUTH USER
# ==============================================================================

AUTH_USER_MODEL = 'api.User'


# ==============================================================================
# 🌍 LANGUAGE / TIMEZONE
# ==============================================================================

LANGUAGE_CODE = 'ja'

TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_TZ = True


# ==============================================================================
# 📁 STATIC / MEDIA
# ==============================================================================

STATIC_URL = 'static/'

STATIC_ROOT = os.path.join(
    BASE_DIR,
    'staticfiles'
)

MEDIA_URL = '/media/'

MEDIA_ROOT = '/usr/src/app/media'


# ==============================================================================
# 🌐 SITE URL
# ==============================================================================

SITE_URL = os.environ.get(

    'SITE_URL',

    'http://localhost:8083'
)


# ==============================================================================
# 🚀 DRF
# ==============================================================================

REST_FRAMEWORK = {

    # --------------------------------------------------------------------------
    # JWT Authentication
    # --------------------------------------------------------------------------

    'DEFAULT_AUTHENTICATION_CLASSES': (

        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    # --------------------------------------------------------------------------
    # Default Permissions
    # --------------------------------------------------------------------------

    'DEFAULT_PERMISSION_CLASSES': (

        'rest_framework.permissions.IsAuthenticated',
    ),
}


# ==============================================================================
# 🔑 SIMPLE JWT
# ==============================================================================

SIMPLE_JWT = {

    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),

    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),

    'AUTH_HEADER_TYPES': ('Bearer',),
}


# ==============================================================================
# ⚙️ DJANGO DEFAULTS
# ==============================================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000