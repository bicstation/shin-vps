# -*- coding: utf-8 -*-
"""
==============================================================================
🚀 API Main Routing Configuration
==============================================================================

SHIN CORE LINX
Multi-Domain Semantic API Gateway

Responsibilities:
    - API Root Registry
    - Namespace Routing
    - Semantic Endpoint Organization
    - Multi-Service Aggregation

==============================================================================
"""

from django.urls import path, include
from django.http import HttpResponse

from api.views import (
    api_root,
    status_check,
)

# ==============================================================================
# 🚀 API NAMESPACE
# ==============================================================================
#
# Enables:
#
# reverse("api:...")
#
# ==============================================================================

app_name = "api"

# ==============================================================================
# 🚀 URL PATTERNS
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🏠 API Root
    # ==========================================================================

    path(
        '',
        api_root,
        name='api_root'
    ),

    # ==========================================================================
    # ❤️ Health Check
    # ==========================================================================

    path(
        'status/',
        status_check,
        name='status_check'
    ),

    # ==========================================================================
    # 📁 Content Hub
    # ==========================================================================

    path(
        'content-hub/',
        include(
            ('api.urls.contenthub_urls', 'contenthub'),
            namespace='contenthub'
        )
    ),

    # ==========================================================================
    # 📰 Articles
    # ==========================================================================

    path(
        'general/posts/',
        include(
            ('api.urls.article_urls', 'articles'),
            namespace='general_articles'
        )
    ),

    path(
        'adult/posts/',
        include(
            ('api.urls.article_urls', 'articles'),
            namespace='adult_articles'
        )
    ),

    path(
        'bs/posts/',
        include(
            ('api.urls.article_urls', 'articles'),
            namespace='bs_articles'
        )
    ),

    path(
        'posts/',
        include(
            ('api.urls.article_urls', 'articles'),
            namespace='articles'
        )
    ),

    # ==========================================================================
    # 👤 AUTH
    # ==========================================================================

    path(
        'auth/',
        include(
            ('api.urls.auth_urls', 'auth'),
            namespace='auth'
        )
    ),

    # ==========================================================================
    # 🛍️ PRODUCTS
    # ==========================================================================

    path(
        'products/',
        include(
            ('api.urls.product_urls', 'products'),
            namespace='products'
        )
    ),

    # ==========================================================================
    # 🔍 FINDER
    # ==========================================================================

    path(
        'finder/',
        include(
            ('api.urls.finder_urls', 'finder'),
            namespace='finder'
        )
    ),

    # ==========================================================================
    # 📊 GENERAL DATA
    # ==========================================================================

    path(
        'general/',
        include(
            ('api.urls.general_urls', 'general'),
            namespace='general'
        )
    ),

    # ==========================================================================
    # 🔞 ADULT
    # ==========================================================================

    path(
        'adult/',
        include(
            ('api.urls.adult_urls', 'adult'),
            namespace='adult'
        )
    ),

    # ==========================================================================
    # 🧬 MASTER DATA
    # ==========================================================================

    path(
        'master/',
        include(
            ('api.urls.master_urls', 'master'),
            namespace='master'
        )
    ),

    # ==========================================================================
    # 💰 BIC SAVING
    # ==========================================================================

    path(
        'bs/',
        include(
            ('api.urls.bs_urls', 'bs'),
            namespace='bs'
        )
    ),

    # ==========================================================================
    # 🤖 AI
    # ==========================================================================

    path(
        'ai/',
        include(
            ('api.urls.ai_urls', 'ai'),
            namespace='ai'
        )
    ),

    # ==========================================================================
    # 🛒 LINKSHARE
    # ==========================================================================

    # path(
    #     'linkshare/',
    #     include(
    #         ('api.urls.linkshare_urls', 'linkshare'),
    #         namespace='linkshare'
    #     )
    # ),

    # ==========================================================================
    # 🛡️ Noise Reduction
    # ==========================================================================

    path(
        'events/stream',
        lambda r: HttpResponse(status=204)
    ),

    path(
        'releases',
        lambda r: HttpResponse(status=204)
    ),
]