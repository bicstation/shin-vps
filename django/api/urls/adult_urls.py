# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/adult_urls.py

from django.urls import path
from api.views import adult_views, master_views

# ネームスペースの階層化 (api:adult:...)
app_name = 'adult'

urlpatterns = [
    # ==========================================================
    # 1. 🔞 統合製品 (Unified Products)
    # ==========================================================
    # Next.js のメイン一覧（AIスコア・黄金比スコアによるソートが可能）
    path('unified-products/', adult_views.UnifiedAdultProductListView.as_view(), name='unified_products'),
    
    # 製品詳細 (正規化されたIDで取得 / AIキャッチコピーや詳細スコアを含む)
    path('products/<str:product_id_unique>/', adult_views.AdultProductDetailAPIView.as_view(), name='product_detail'),

    # ==========================================================
    # 2. 📊 分析・ランキング (Analysis & Ranking)
    # ==========================================================
    # 市場分析データ (平均スペックスコアなど)
    path('analysis/', adult_views.PlatformMarketAnalysisAPIView.as_view(), name='market_analysis'),
    
    # 総合ランキング (スペックスコア順)
    path('ranking/', adult_views.AdultProductRankingAPIView.as_view(), name='ranking'),
    
    # 💡 黄金比・タクソノミー（階層構造・タグ集計）
    # ?type=actresses&ordering=-profile__ai_power_score で「黄金比ランキング」として機能
    path('taxonomy/', adult_views.AdultTaxonomyIndexAPIView.as_view(), name='taxonomy_index'),

    # ==========================================================
    # 3. 🗺️ 階層ナビゲーション (Navigation)
    # ==========================================================
    # FANZA/DMMのフロア構造と製品カウント
    path('navigation/floors/', adult_views.FanzaFloorNavigationAPIView.as_view(), name='floor_navigation'),

    # ==========================================================
    # 4. 🏷️ マスターデータ（アダルト専用）
    # ==========================================================
    # 基本的なマスタリスト
    path('actresses/', master_views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', master_views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', master_views.MakerListAPIView.as_view(), name='maker_list'),
    
    # 💡 Linkshare (DMM等) の生データ確認用
    path('linkshare-products/', adult_views.LinkshareProductListAPIView.as_view(), name='linkshare_list'),
]