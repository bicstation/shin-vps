# api/urls/__init__.py
# api gateway
# /home/maya/shin-dev/shin-vps/django/api/urls/__init__.py

from django.urls import ( path, include, )
from api.views import ( api_root, status_check, )

urlpatterns = [

    path("", api_root),

    path(
        "status/",
        status_check,
    ),

    # =====================================================
    # PC
    # =====================================================

    path(
        "pc/",
        include(
            "api.urls.pc_urls"
        )
    ),

    # =====================================================
    # ADULT
    # =====================================================

    path(
        "adult/",
        include(
            "api.urls.adult_urls"
        )
    ),

    # =====================================================
    # ARTICLES
    # =====================================================

    path(
        "articles/",
        include(
            "api.urls.article_urls"
        )
    ),

    # =====================================================
    # AI
    # =====================================================

    path(
        "ai/",
        include(
            "api.urls.ai_urls"
        )
    ),

    # =====================================================
    # CONTENT HUB
    # =====================================================

    path(
        "content/",
        include(
            "api.urls.contenthub_urls"
        )
    ),

    # =====================================================
    # AUTH
    # =====================================================

    path(
        "auth/",
        include(
            "api.urls.auth_urls"
        )
    ),

    # =====================================================
    # MASTER
    # =====================================================

    path(
        "master/",
        include(
            "api.urls.master_urls"
        )
    ),

    # =====================================================
    # BS
    # =====================================================

    path(
        "bs/",
        include(
            "api.urls.bs_urls"
        )
    ),
]