from django.http import JsonResponse
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend # 追加
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
from .models.pc_products import PCProduct  

# --------------------------------------------------------------------------
# 0. /api/ ルートエンドポイント
# --------------------------------------------------------------------------
def api_root(request):
    return JsonResponse({
        "message": "Welcome to Tiper API Gateway", 
        "endpoints": {
            "status": "/api/status/",
            "products": {
                "pc_products_list": "/api/pc-products/", 
                "pc_product_detail": "/api/pc-products/{unique_id}/", 
                "adult_products_list": "/api/adults/",
                "linkshare_products_list": "/api/linkshare/",
                "adult_product_detail": "/api/adults/{product_id_unique}/",
                "linkshare_product_detail": "/api/linkshare/{sku}/"
            }
        }
    }, status=200)

def status_check(request):
    return JsonResponse({"status": "API is running"}, status=200)

# --------------------------------------------------------------------------
# 1. アダルト商品データ API ビュー (AdultProduct)
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    # .order_by('-id') または '-created_at' を追加してデフォルトを最新順に
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    ).order_by('-id') 
    
    serializer_class = AdultProductSerializer
    
    # 💡 フィルタと並び替えの機能を有効化
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    # 💡 どの項目で絞り込みを許可するか（Next.jsのURLパラメータに対応）
    filterset_fields = {
        'genres': ['exact'],
        'actresses': ['exact'],
        'maker': ['exact'],
        'series': ['exact'],
        'label': ['exact'],
    }
    
    # 💡 どの項目で並び替えを許可するか
    ordering_fields = ['id', 'price'] 
    # ※もしモデルに created_at があれば追加してください

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    )
    serializer_class = AdultProductSerializer
    lookup_field = 'product_id_unique'

    def get_object(self):
        # URLから受け取った値を取得
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        # 💡 デバッグログをコンソールに出力（docker logs -f django-v2 で確認可能）
        print(f"DEBUG: Detailed request for value: '{lookup_value}' (Type: {type(lookup_value)})")

        if lookup_value.isdigit():
            target_id = int(lookup_value)
            print(f"DEBUG: Attempting to find by ID: {target_id}")
            # IDで検索
            obj = get_object_or_404(AdultProduct, id=target_id)
            print(f"DEBUG: Found object: {obj.title}")
            return obj
        
        print(f"DEBUG: Attempting to find by product_id_unique: {lookup_value}")
        # 文字列で検索
        return get_object_or_404(AdultProduct, product_id_unique=lookup_value)


# --------------------------------------------------------------------------
# 2. 以降のビュー（変更なし）
# --------------------------------------------------------------------------
class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    lookup_field = 'sku'

class PCProductListAPIView(generics.ListAPIView):
    serializer_class = PCProductSerializer
    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True).order_by('-updated_at')
        site = self.request.query_params.get('site')
        genre = self.request.query_params.get('genre')
        if site: queryset = queryset.filter(site_prefix=site)
        if genre: queryset = queryset.filter(unified_genre=genre)
        return queryset

class PCProductDetailAPIView(generics.RetrieveAPIView):
    queryset = PCProduct.objects.all()
    serializer_class = PCProductSerializer
    lookup_field = 'unique_id'

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