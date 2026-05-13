# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

from .views import home


# ==============================================================================
# 🚀 SHIN CORE LINX｜ROOT URL CONFIG
# ==============================================================================
#
# Responsibilities:
#
# - API Namespace Authority
# - Admin Routing
# - Media Serving
# - Frontend Catch-All
#
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🔗 API ROOT
    # ==========================================================================
    #
    # 🚀 namespace="api" が超重要
    #
    # reverse('api:...')
    # を成立させるために必要
    #
    # ==========================================================================

    path(
        'api/',
        include(
            ('api.urls', 'api'),
            namespace='api'
        )
    ),

    # ==========================================================================
    # 🛠 Django Admin
    # ==========================================================================

    path(
        'admin/',
        admin.site.urls
    ),

    # ==========================================================================
    # 🏠 Root
    # ==========================================================================

    path(
        '',
        home,
        name='home'
    ),
]


# ==============================================================================
# 📦 MEDIA
# ==============================================================================
#
# media は frontend catch-all より前
#
# ==============================================================================

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)


# ==============================================================================
# 🌐 FRONTEND CATCH-ALL
# ==============================================================================
#
# API / admin / media / static 以外は
# Next.js frontend へ流す
#
# ==============================================================================

urlpatterns += [

    re_path(
        r'^(?!api/|admin/|static/|media/).*$',
        home,
        name='frontend'
    ),
]