# api/views.py

from django.http import JsonResponse
from rest_framework import generics

# シリアライザのインポート
from .serializers import (
    AdultProductSerializer, 
    LinkshareProductSerializer,
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

# --------------------------------------------------------------------------
# 0. /api/ ルートエンドポイント
# --------------------------------------------------------------------------
def api_root(request):
    """
    /api/ へのアクセス時に、利用可能なエンドポイントを提示する (404/500解消用)
    """
    return JsonResponse({
        "message": "Welcome to Tiper API Gateway", 
        "endpoints": {
            "status": "/api/status/",
            "products": {
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
    """
    アダルト商品リストを取得するためのビュー (/api/adults/)
    """
    # prefetch_related を使用してリレーションデータのクエリを最適化
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    )
    serializer_class = AdultProductSerializer

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    """
    特定のユニークIDを持つアダルト商品を取得するためのビュー (/api/adults/<product_id_unique>/)
    """
    queryset = AdultProduct.objects.all().prefetch_related(
        'maker', 'label', 'director', 'series', 'genres', 'actresses'
    )
    serializer_class = AdultProductSerializer
    lookup_field = 'product_id_unique'


# --------------------------------------------------------------------------
# 2. Linkshare商品データ API ビュー (LinkshareProduct)
# --------------------------------------------------------------------------

class LinkshareProductListAPIView(generics.ListAPIView): 
    """
    LinkShare商品リストを取得するためのビュー (/api/linkshare/)
    """
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    """
    特定のSKUを持つLinkShare商品を取得するためのビュー (/api/linkshare/<sku>/)
    """
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    lookup_field = 'sku'

# --------------------------------------------------------------------------
# 3. マスターデータ API ビュー (JSON表示用)
# --------------------------------------------------------------------------

class ActressListAPIView(generics.ListAPIView):
    """女優一覧を表示: /api/actresses/"""
    queryset = Actress.objects.all().order_by('name')
    serializer_class = ActressSerializer

class GenreListAPIView(generics.ListAPIView):
    """ジャンル一覧を表示: /api/genres/"""
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer

class MakerListAPIView(generics.ListAPIView):
    """メーカー一覧を表示: /api/makers/"""
    queryset = Maker.objects.all().order_by('name')
    serializer_class = MakerSerializer

class LabelListAPIView(generics.ListAPIView):
    """レーベル一覧を表示: /api/labels/"""
    queryset = Label.objects.all().order_by('name')
    serializer_class = LabelSerializer

class DirectorListAPIView(generics.ListAPIView):
    """監督一覧を表示: /api/directors/"""
    queryset = Director.objects.all().order_by('name')
    serializer_class = DirectorSerializer

class SeriesListAPIView(generics.ListAPIView):
    """シリーズ一覧を表示: /api/series/"""
    queryset = Series.objects.all().order_by('name')
    serializer_class = SeriesSerializer