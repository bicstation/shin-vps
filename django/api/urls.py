# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls.py

from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    # -----------------------------------------------------------
    # 0. /api/ ルートエンドポイント
    # -----------------------------------------------------------
    # APIの全体像を確認するためのエントリーポイント
    path('', views.api_root, name='api_root'), 

    # 1. サーバーの稼働確認用
    # システムのヘルスチェックや疎通確認に使用
    path('status/', views.status_check, name='status_check'),
    
    # -----------------------------------------------------------
    # 2. 認証・ユーザー関連 (User)
    # -----------------------------------------------------------
    # 💡 ユーザー新規登録: ユーザー名、メール、PWを送信
    path('auth/register/', views.RegisterView.as_view(), name='auth_register'),

    # 💡 カスタムJWTログイン: ID/PWを送信してトークン + ユーザー情報(site_group等)を取得
    # views.py で定義した LoginView (CustomTokenObtainPairSerializer使用) を呼び出します
    path('auth/login/', views.LoginView.as_view(), name='token_obtain_pair'),
    
    # 💡 トークン更新: 期限切れのアクセストークンを更新
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 💡 自分のプロフィール取得・更新
    # 🚀 重要: views.py で拡張した UserProfileView により、ここでドメイン情報がDBに保存されます
    path('auth/me/', views.UserProfileView.as_view(), name='user_me'),
    
    # -----------------------------------------------------------
    # 3. アダルト商品データ エンドポイント (AdultProduct)
    # -----------------------------------------------------------
    path('adults/', views.AdultProductListAPIView.as_view(), name='adult_product_list'),
    path('adults/<str:product_id_unique>/', views.AdultProductDetailAPIView.as_view(), name='adult_product_detail'),

    # -----------------------------------------------------------
    # 4. PC・ソフトウェア製品データ エンドポイント (PCProduct)
    # -----------------------------------------------------------
    # GET /api/pc-products/
    # 💡 フィルタ（budget, ram, npu, gpu, maker, unified_genre等）を適用して一覧を取得
    path('pc-products/', views.PCProductListAPIView.as_view(), name='pc_product_list'),

    # GET /api/pc-products/ranking/
    # 🏆 AI解析スコア(spec_score)が高い順に取得（スペック最強ランキング）
    path('pc-products/ranking/', views.PCProductRankingView.as_view(), name='pc_product_ranking'),

    # 🚀 GET /api/pc-products/popularity-ranking/
    # 🔥 注目度（PV数）が高い順に取得（トレンドランキング・ベスト100）
    path('pc-products/popularity-ranking/', views.PCProductPopularityRankingView.as_view(), name='pc_product_popularity_ranking'),

    # GET /api/pc-makers/
    # メーカー別の製品数やロゴ、リンク用データを取得
    path('pc-makers/', views.PCProductMakerListView.as_view(), name='pc_maker_list'),

    # GET /api/pc-sidebar-stats/
    # 💡 サイドバーの絞り込み用メニューを動的に取得
    path('pc-sidebar-stats/', views.pc_sidebar_stats, name='pc_sidebar_stats'),

    # GET /api/pc-products/<unique_id>/
    # 💡 詳細情報を取得。アクセス時にPVもカウントされます
    path('pc-products/<str:unique_id>/', views.PCProductDetailAPIView.as_view(), name='pc_product_detail'),

    # GET /api/pc-products/<unique_id>/price-history/
    # 📈 特定製品の価格推移データを取得（グラフ表示用）
    path('pc-products/<str:unique_id>/price-history/', views.pc_product_price_history, name='pc_product_price_history'),

    # GET /api/pc-products/<unique_id>/stats-history/
    # 📊 特定製品のPV推移データを取得
    path('pc-products/<str:unique_id>/stats-history/', views.pc_product_stats_history, name='pc_product_stats_history'),

    # -----------------------------------------------------------
    # 5. コメント投稿 エンドポイント (ProductComment)
    # -----------------------------------------------------------
    # POST /api/comments/ 
    # 💡 ログインユーザーとしてコメントを新規作成
    path('comments/', views.ProductCommentCreateView.as_view(), name='comment_create'),

    # -----------------------------------------------------------
    # 6. Linkshare商品データ エンドポイント (LinkshareProduct)
    # -----------------------------------------------------------
    path('linkshare/', views.LinkshareProductListAPIView.as_view(), name='linkshare_product_list'),
    path('linkshare/<str:sku>/', views.LinkshareProductDetailAPIView.as_view(), name='linkshare_product_detail'),

    # -----------------------------------------------------------
    # 7. マスターデータ (仕分け項目) エンドポイント
    # -----------------------------------------------------------
    path('actresses/', views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', views.SeriesListAPIView.as_view(), name='series_list'),
]