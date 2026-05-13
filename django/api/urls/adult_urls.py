# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/adult_urls.py

from django.urls import path

# ==============================================================================
# 🚀 Adult Views
# ==============================================================================

from api.views.adult_views import (

    UnifiedAdultProductListView,

    AdultProductDetailAPIView,

    AdultProductRankingAPIView,

    PlatformMarketAnalysisAPIView,

    AdultTaxonomyIndexAPIView,

    ActressSearchAPIView,

    FanzaFloorNavigationAPIView,

    LinkshareProductListAPIView,

    AdultSidebarStatsAPIView,
)

# ==============================================================================
# 🚀 Master Views
# ==============================================================================

from api.views.master_views import (

    ActressListAPIView,

    GenreListAPIView,

    MakerListAPIView,
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "adult"

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🔞 Unified Products
    # ==========================================================================

    path(
        "unified-products/",
        UnifiedAdultProductListView.as_view(),
        name="unified_products",
    ),

    # ==========================================================================
    # 📄 Product Detail
    # ==========================================================================

    path(
        "products/<str:product_id_unique>/",
        AdultProductDetailAPIView.as_view(),
        name="product_detail",
    ),

    # ==========================================================================
    # 📊 Market Analysis
    # ==========================================================================

    path(
        "analysis/",
        PlatformMarketAnalysisAPIView.as_view(),
        name="market_analysis",
    ),

    # ==========================================================================
    # 🏆 Ranking
    # ==========================================================================

    path(
        "ranking/",
        AdultProductRankingAPIView.as_view(),
        name="ranking",
    ),

    # ==========================================================================
    # 🧬 Taxonomy
    # ==========================================================================

    path(
        "taxonomy/",
        AdultTaxonomyIndexAPIView.as_view(),
        name="taxonomy_index",
    ),

    # ==========================================================================
    # 🔍 Actress Search
    # ==========================================================================

    path(
        "actress-search/",
        ActressSearchAPIView.as_view(),
        name="actress_search",
    ),

    # ==========================================================================
    # 🧭 Floor Navigation
    # ==========================================================================

    path(
        "navigation/floors/",
        FanzaFloorNavigationAPIView.as_view(),
        name="floor_navigation",
    ),

    # ==========================================================================
    # 👩 Actress Master
    # ==========================================================================

    path(
        "actresses/",
        ActressListAPIView.as_view(),
        name="actress_list",
    ),

    # ==========================================================================
    # 🎭 Genre Master
    # ==========================================================================

    path(
        "genres/",
        GenreListAPIView.as_view(),
        name="genre_list",
    ),

    # ==========================================================================
    # 🏭 Maker Master
    # ==========================================================================

    path(
        "makers/",
        MakerListAPIView.as_view(),
        name="maker_list",
    ),

    # ==========================================================================
    # 🛒 LinkShare
    # ==========================================================================

    path(
        "linkshare-products/",
        LinkshareProductListAPIView.as_view(),
        name="linkshare_products",
    ),

    # ==========================================================================
    # 📊 Sidebar Stats
    # ==========================================================================

    path(
        "sidebar-stats/",
        AdultSidebarStatsAPIView.as_view(),
        name="sidebar_stats",
    ),
]