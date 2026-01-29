# -*- coding: utf-8 -*-
# E:\SHIN-VPS\django\api\views.py

from django.http import JsonResponse
from rest_framework import generics, filters, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import logging
from urllib.parse import unquote

# ログの設定
logger = logging.getLogger(__name__)

# シリアライザのインポート
from .serializers import (
    AdultProductSerializer, 
    LinkshareProductSerializer,
    PCProductSerializer,  
    ActressSerializer,
    GenreSerializer,
    MakerSerializer,
    LabelSerializer,
    DirectorSerializer,
    SeriesSerializer
)

# モデルのインポート
from .models import (
    AdultProduct, 
    LinkshareProduct, 
    Actress, 
    Genre, 
    Maker, 
    Label, 
    Director, 
    Series
)
# 価格履歴モデル、PC製品モデル
from .models.pc_products import PCProduct, PCAttribute, PriceHistory

# --------------------------------------------------------------------------
# 💡 カスタムページネーション
# --------------------------------------------------------------------------
class PCProductLimitOffsetPagination(pagination.LimitOffsetPagination):
    """
    Next.jsの ?offset=x&limit=y に対応するためのページネーション
    """
    default_limit = 10
    max_limit = 100

# --------------------------------------------------------------------------
# 0. /api/ ルートエンドポイント
# --------------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API全体のマップを返す（ブラウザでの確認用）
    """
    return Response({
        "message": "Welcome to Tiper API Gateway", 
        "endpoints": {
            "status": "/api/status/",
            "auth": {
                "login": "/api/auth/login/",
                "logout": "/api/auth/logout/",
                "user": "/api/auth/user/"
            },
            "products": {
                "pc_products_list": "/api/pc-products/", 
                "pc_ranking": "/api/pc-products/ranking/",
                "pc_product_makers": "/api/pc-makers/",
                "pc_sidebar_stats": "/api/pc-sidebar-stats/",
                "pc_product_detail": "/api/pc-products/{unique_id}/", 
                "pc_price_history": "/api/pc-products/{unique_id}/price-history/",
                "adult_products_list": "/api/adults/",
                "linkshare_products_list": "/api/linkshare/",
                "adult_product_detail": "/api/adults/{product_id_unique}/",
                "linkshare_product_detail": "/api/linkshare/{sku}/"
            },
            "masters": {
                "actresses": "/api/actresses/",
                "genres": "/api/genres/",
                "makers": "/api/makers/",
                "labels": "/api/labels/",
                "directors": "/api/directors/",
                "series": "/api/series/"
            }
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def status_check(request):
    """
    稼働確認用エンドポイント
    """
    return Response({"status": "API is running", "environment": "production" if not request.is_secure() else "secure"}, status=200)

# --------------------------------------------------------------------------
# 🔑 認証 (Auth) 関連ビュー
# --------------------------------------------------------------------------
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])  # ログイン時はCSRFチェックをDRF層で回避し、内部でlogin()を処理
def login_view(request):
    """
    Auth.js (NextAuth.js) 認証用エンドポイント
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    logger.info(f"Login attempt for user: {username}")
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user) # ここで Django の sessionid が発行される
        return Response({
            "status": "success",
            "hasAccess": True,
            "user": {
                "id": user.id,
                "name": user.username,
                "email": user.email,
            }
        })
    else:
        logger.warning(f"Failed login attempt for user: {username}")
        return Response({
            "status": "error",
            "hasAccess": False,
            "error": "ユーザー名またはパスワードが正しくありません。"
        }, status=401)

@api_view(['POST'])
def logout_view(request):
    """
    セッションを終了してログアウト
    """
    logout(request)
    return Response({"message": "Successfully logged out", "status": "success"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_view(request):
    """
    現在のセッションに基づいたユーザー情報を取得
    """
    user = request.user
    return Response({
        "id": user.id,
        "name": user.username,
        "email": user.email,
        "hasAccess": True
    })

# --------------------------------------------------------------------------
# 🏆 ランキングビュー
# --------------------------------------------------------------------------
class PCProductRankingView(generics.ListAPIView):
    """
    AI解析スコア(spec_score)に基づいた上位製品ランキングを取得
    """
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return PCProduct.objects.filter(
            is_active=True,
            spec_score__gt=0
        ).order_by('-spec_score', '-updated_at')[:20]

# --------------------------------------------------------------------------
# 1. アダルト商品データ API ビュー (AdultProduct)
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    ).order_by('-id') 
    
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = {
        'genres': ['exact'],
        'actresses': ['exact'],
        'maker': ['exact'],
        'series': ['exact'],
        'label': ['exact'],
    }
    ordering_fields = ['id', 'price', 'release_date'] 
    search_fields = ['title']

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    )
    serializer_class = AdultProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id_unique'

    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_field)
        # ID（数値）での検索と unique_id（文字列）での検索を両立
        if lookup_value.isdigit():
            return get_object_or_404(AdultProduct, id=int(lookup_value))
        return get_object_or_404(AdultProduct, product_id_unique=lookup_value)

# --------------------------------------------------------------------------
# 2. PC・ソフトウェア製品データ API ビュー (PCProduct)
# --------------------------------------------------------------------------
class PCProductListAPIView(generics.ListAPIView):
    """
    PCおよびソフトウェア製品一覧取得
    """
    serializer_class = PCProductSerializer
    pagination_class = PCProductLimitOffsetPagination
    permission_classes = [AllowAny]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = [
        'site_prefix', 'unified_genre', 'stock_status', 
        'is_posted', 'is_ai_pc', 'is_download',
        'cpu_socket', 'motherboard_chipset', 'ram_type',
        'license_term', 'edition'
    ]
    
    search_fields = [
        'name', 'cpu_model', 'gpu_model', 'os_support',
        'edition', 'description', 'ai_content'
    ]
    
    ordering_fields = [
        'price', 'updated_at', 'created_at', 'memory_gb', 
        'spec_score', 'score_cpu', 'score_gpu', 'score_cost', 
        'score_portable', 'score_ai', 'npu_tops', 'power_recommendation'
    ]

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True).prefetch_related('attributes')
        
        maker = self.request.query_params.get('maker')
        attribute_slug = self.request.query_params.get('attribute')
        
        if maker:
            queryset = queryset.filter(maker__iexact=unquote(maker))
            
        if attribute_slug:
            queryset = queryset.filter(attributes__slug=unquote(attribute_slug))
            
        return queryset.order_by('-updated_at', 'id')

class PCProductDetailAPIView(generics.RetrieveAPIView):
    """
    PC/ソフト製品詳細取得 (unique_id による取得)
    """
    queryset = PCProduct.objects.all().prefetch_related('attributes')
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'

class PCProductMakerListView(APIView):
    """
    メーカー名ごとの製品数を取得
    """
    permission_classes = [AllowAny]
    def get(self, request):
        genre = request.query_params.get('genre')
        qs = PCProduct.objects.filter(is_active=True).exclude(maker__isnull=True).exclude(maker='')
        
        if genre:
            qs = qs.filter(unified_genre=genre)

        maker_counts = qs.values('maker').annotate(count=Count('id')).order_by('maker')
        return Response(list(maker_counts))

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):
    """
    サイドバー表示用：属性タイプごとに製品数を集計
    """
    attrs = PCAttribute.objects.annotate(
        product_count=Count('products')
    ).filter(product_count__gt=0).order_by('attr_type', 'order', 'name')
    
    sidebar_data = {}
    for attr in attrs:
        type_display = attr.get_attr_type_display()
        # "1. CPU" のような表示から "CPU" だけを抽出
        if type_display and ". " in type_display:
            type_display = type_display.split(". ", 1)[1]
            
        if type_display not in sidebar_data:
            sidebar_data[type_display] = []
        
        sidebar_data[type_display].append({
            'id': attr.id,
            'name': attr.name,
            'slug': attr.slug,
            'count': attr.product_count
        })
    
    return Response(sidebar_data)

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_product_price_history(request, unique_id):
    """
    特定のPC商品の価格推移データを取得する
    """
    product = get_object_or_404(PCProduct, unique_id=unquote(unique_id))
    history = PriceHistory.objects.filter(product=product).order_by('recorded_at')[:30]
    
    data = {
        "name": product.name,
        "labels": [h.recorded_at.strftime('%Y/%m/%d') for h in history],
        "prices": [h.price for h in history]
    }
    return Response(data)

# --------------------------------------------------------------------------
# 3. Linkshare商品データ API ビュー
# --------------------------------------------------------------------------
class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'sku'

# --------------------------------------------------------------------------
# 4. マスターデータ系 API ビュー
# --------------------------------------------------------------------------
class MasterListBaseView(generics.ListAPIView):
    """マスターデータ一覧のベースクラス"""
    permission_classes = [AllowAny]
    pagination_class = None # マスターデータは全件取得が多いため

class ActressListAPIView(MasterListBaseView):
    queryset = Actress.objects.all().order_by('name')
    serializer_class = ActressSerializer

class GenreListAPIView(MasterListBaseView):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer

class MakerListAPIView(MasterListBaseView):
    queryset = Maker.objects.all().order_by('name')
    serializer_class = MakerSerializer

class LabelListAPIView(MasterListBaseView):
    queryset = Label.objects.all().order_by('name')
    serializer_class = LabelSerializer

class DirectorListAPIView(MasterListBaseView):
    queryset = Director.objects.all().order_by('name')
    serializer_class = DirectorSerializer

class SeriesListAPIView(MasterListBaseView):
    queryset = Series.objects.all().order_by('name')
    serializer_class = SeriesSerializer