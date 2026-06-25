# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/urls/__init__.py
# SHIN CORE LINX API Gateway

from django.urls import (
    include,
    path,
)

from api.views import (
    api_root,
    status_check,
)

urlpatterns = [

    # ==========================================================
    # API ROOT
    # ==========================================================

    path(
        "",
        api_root,
    ),

    path(
        "status/",
        status_check,
    ),

    # ==========================================================
    # PC PLATFORM
    # ==========================================================

    path(
        "pc/",
        include(
            "api.urls.pc_urls",
        ),
    ),

    # ==========================================================
    # ADULT PLATFORM
    # ==========================================================

    path(
        "adult/",
        include(
            "api.urls.adult_urls",
        ),
    ),

    # ==========================================================
    # CONTENT PLATFORM
    # ==========================================================

    path(
        "articles/",
        include(
            "api.urls.article_urls",
        ),
    ),

    path(
        "content/",
        include(
            "api.urls.contenthub_urls",
        ),
    ),

    # ==========================================================
    # AI PLATFORM
    # ==========================================================

    path(
        "ai/",
        include(
            "api.urls.ai_urls",
        ),
    ),

    # ==========================================================
    # AUTH PLATFORM
    # ==========================================================

    path(
        "auth/",
        include(
            "api.urls.auth_urls",
        ),
    ),

    # ==========================================================
    # MASTER DATA
    # ==========================================================

    path(
        "master/",
        include(
            "api.urls.master_urls",
        ),
    ),

    # ==========================================================
    # BIC STATION
    # ==========================================================

    path(
        "bs/",
        include(
            "api.urls.bs_urls",
        ),
    ),
]