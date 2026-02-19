# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/adult_urls.py

from django.urls import path
from api.views import adult_views, master_views # 分割後のファイルを想定

# ネームスペースの階層化 (api:adult:...)
app_name = 'adult'

urlpatterns = [
    # ==========================================================
    # 1. 🔞 統合製品 (Unified Products)
    # ==========================================================
    # Next.js のメイン一覧
    path('unified-products/', adult_views.UnifiedAdultProductListView.as_view(), name='unified_products'),
    
    # 製品詳細 (正規化されたIDで取得)
    path('products/<str:product_id_unique>/', adult_views.AdultProductDetailAPIView.as_view(), name='product_detail'),

    # ==========================================================
    # 2. 📊 分析・ランキング (Analysis & Ranking)
    # ==========================================================
    # 市場分析データ
    path('analysis/', adult_views.PlatformMarketAnalysisAPIView.as_view(), name='market_analysis'),
    
    # ランキング
    path('ranking/', adult_views.AdultProductRankingAPIView.as_view(), name='ranking'),
    
    # タクソノミー（階層構造・タグ集計）
    path('taxonomy/', adult_views.AdultTaxonomyIndexAPIView.as_view(), name='taxonomy_index'),

    # ==========================================================
    # 3. 🗺️ 階層ナビゲーション (Navigation)
    # ==========================================================
    path('navigation/floors/', adult_views.FanzaFloorNavigationAPIView.as_view(), name='floor_navigation'),

    # ==========================================================
    # 4. 🏷️ マスターデータ（アダルト専用）
    # ==========================================================
    # 本来は master_urls.py に分けても良いですが、利便性のためこちらにも配置
    path('actresses/', master_views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', master_views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', master_views.MakerListAPIView.as_view(), name='maker_list'),
]