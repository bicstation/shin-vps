from django.http import JsonResponse
from rest_framework import generics

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
    """
    /api/ へのアクセス時に、利用可能なエンドポイントを提示する
    """
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
            },
            "master_data": {
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
    """APIの状態をチェックするためのシンプルなビュー"""
    return JsonResponse({"status": "API is running and URLs are configured correctly"}, status=200)

# --------------------------------------------------------------------------
# 1. アダルト商品データ API ビュー (AdultProduct)
# --------------------------------------------------------------------------
class AdultProductListAPIView(generics.ListAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    )
    serializer_class = AdultProductSerializer

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    )
    serializer_class = AdultProductSerializer
    lookup_field = 'product_id_unique'


# --------------------------------------------------------------------------
# 2. Linkshare商品データ API ビュー (LinkshareProduct)
# --------------------------------------------------------------------------
class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    lookup_field = 'sku'


# --------------------------------------------------------------------------
# 3. PC製品データ API ビュー (PCProduct)
# --------------------------------------------------------------------------
class PCProductListAPIView(generics.ListAPIView):
    """
    PC製品（Lenovo, HP, Acer等）のリストを取得するビュー (/api/pc-products/)
    クエリパラメータでサイトやジャンルの絞り込みが可能
    例: /api/pc-products/?site=lenovo&genre=gaming
    """
    serializer_class = PCProductSerializer

    def get_queryset(self):
        # 掲載中(is_active=True)のものを基本とし、更新順で並べる
        queryset = PCProduct.objects.filter(is_active=True).order_by('-updated_at')
        
        # クエリパラメータを取得
        site = self.request.query_params.get('site')
        genre = self.request.query_params.get('genre')

        # フィルタリングの適用
        if site:
            queryset = queryset.filter(site_prefix=site)
        if genre:
            queryset = queryset.filter(unified_genre=genre)
            
        return queryset

class PCProductDetailAPIView(generics.RetrieveAPIView):
    """
    特定の固有IDを持つPC製品を取得するビュー (/api/pc-products/<unique_id>/)
    """
    queryset = PCProduct.objects.all()
    serializer_class = PCProductSerializer
    lookup_field = 'unique_id'


# --------------------------------------------------------------------------
# 4. マスターデータ API ビュー (JSON表示用)
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