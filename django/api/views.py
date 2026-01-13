from django.http import JsonResponse
from rest_framework import generics, filters, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
import logging

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
from .models.pc_products import PCProduct, PCAttribute  # 💡 PCAttribute を追加

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
def api_root(request):
    """
    API全体のマップを返す
    """
    return JsonResponse({
        "message": "Welcome to Tiper API Gateway", 
        "endpoints": {
            "status": "/api/status/",
            "products": {
                "pc_products_list": "/api/pc-products/", 
                "pc_product_makers": "/api/pc-makers/",
                "pc_sidebar_stats": "/api/pc-sidebar-stats/", # 🚀 追加
                "pc_product_detail": "/api/pc-products/{unique_id}/", 
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
    }, status=200)

def status_check(request):
    """
    稼働確認用エンドポイント
    """
    return JsonResponse({"status": "API is running"}, status=200)

# --------------------------------------------------------------------------
# 1. アダルト商品データ API ビュー (AdultProduct)
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    ).order_by('-id') 
    
    serializer_class = AdultProductSerializer
    
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
    lookup_field = 'product_id_unique'

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        if lookup_value.isdigit():
            target_id = int(lookup_value)
            obj = get_object_or_404(AdultProduct, id=target_id)
            return obj
        
        return get_object_or_404(AdultProduct, product_id_unique=lookup_value)

# --------------------------------------------------------------------------
# 2. PC製品データ API ビュー (PCProduct)
# --------------------------------------------------------------------------
class PCProductListAPIView(generics.ListAPIView):
    """
    PC製品一覧取得：メーカー名やスペック属性でのフィルタリングに対応
    """
    serializer_class = PCProductSerializer
    pagination_class = PCProductLimitOffsetPagination
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    filterset_fields = ['site_prefix', 'unified_genre', 'stock_status', 'is_posted']
    
    search_fields = ['name', 'description', 'ai_content']
    ordering_fields = ['price', 'updated_at', 'created_at']

    def get_queryset(self):
        # 🚀 attributesをprefetchしてクエリ回数を削減
        queryset = PCProduct.objects.filter(is_active=True).prefetch_related('attributes')
        
        # 💡 クエリパラメータによるフィルタリング
        maker = self.request.query_params.get('maker', None)
        attribute_slug = self.request.query_params.get('attribute', None)
        
        if maker and maker.strip() != "":
            queryset = queryset.filter(maker__iexact=maker)
            
        if attribute_slug:
            # 指定されたスラッグを持つ属性が紐付いている製品を抽出
            queryset = queryset.filter(attributes__slug=attribute_slug)
            
        return queryset.order_by('-updated_at', 'id')

class PCProductDetailAPIView(generics.RetrieveAPIView):
    """
    PC製品詳細取得
    """
    queryset = PCProduct.objects.all().prefetch_related('attributes')
    serializer_class = PCProductSerializer
    lookup_field = 'unique_id'

class PCProductMakerListView(APIView):
    """
    PCProductモデルからメーカー名と製品数をカウントして取得する
    """
    def get(self, request):
        maker_counts = PCProduct.objects.filter(is_active=True) \
            .exclude(maker__isnull=True) \
            .exclude(maker='') \
            .values('maker') \
            .annotate(count=Count('id')) \
            .order_by('maker')
        
        return Response(list(maker_counts))

@api_view(['GET'])
def pc_sidebar_stats(request):
    """
    🚀 [NEW] サイドバー用にスペック属性（CPU、メモリ等）ごとの統計を返す
    """
    # 製品が1件以上紐付いている属性を取得
    attrs = PCAttribute.objects.annotate(
        product_count=Count('products')
    ).filter(product_count__gt=0).order_by('attr_type', 'order', 'name')
    
    sidebar_data = {}
    for attr in attrs:
        # get_attr_type_display() を使って "cpu" -> "CPU" のように取得
        type_display = attr.get_attr_type_display()
        if type_display not in sidebar_data:
            sidebar_data[type_display] = []
        
        sidebar_data[type_display].append({
            'id': attr.id,
            'name': attr.name,
            'slug': attr.slug,
            'count': attr.product_count
        })
    
    return Response(sidebar_data)

# --------------------------------------------------------------------------
# 3. Linkshare商品データ API ビュー (LinkshareProduct)
# --------------------------------------------------------------------------
class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    lookup_field = 'sku'

# --------------------------------------------------------------------------
# 4. マスターデータ系 API ビュー
# --------------------------------------------------------------------------
class ActressListAPIView(generics.ListAPIView):
    queryset = Actress.objects.all().order_by('name')
    serializer_class = ActressSerializer

class GenreListAPIView(generics.ListAPIView):
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer

class MakerListAPIView(generics.ListAPIView):
    queryset = Maker.objects.all().order_by('name')
    serializer_class = MakerSerializer

class LabelListAPIView(generics.ListAPIView):
    queryset = Label.objects.all().order_by('name')
    serializer_class = LabelSerializer

class DirectorListAPIView(generics.ListAPIView):
    queryset = Director.objects.all().order_by('name')
    serializer_class = DirectorSerializer

class SeriesListAPIView(generics.ListAPIView):
    queryset = Series.objects.all().order_by('name')
    serializer_class = SeriesSerializer