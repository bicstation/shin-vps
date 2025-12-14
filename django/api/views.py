# api/views.py

from django.http import JsonResponse
from rest_framework import generics

# ★★★ 修正: NormalProduct と NormalProductSerializer を LinkshareProduct に変更 ★★★
from .serializers import AdultProductSerializer, LinkshareProductSerializer 
from .models import AdultProduct, LinkshareProduct # モデル名も修正

# --------------------------------------------------------------------------
# 0. /api/ ルートエンドポイントの追加
# --------------------------------------------------------------------------
def api_root(request):
    """
    /api/ へのアクセス時に、利用可能なエンドポイントを提示する (404/500解消用)
    """
    return JsonResponse({
        "message": "Welcome to Tiper API Gateway", 
        "endpoints": {
            "status": "/api/status/",
            "adult_products_list": "/api/adults/", 
            "linkshare_products_list": "/api/linkshare/", # ★ エンドポイント名を Linkshare に変更
            "product_detail": "/api/adults/{id}/"
        }
    }, status=200)

def status_check(request):
    """APIの状態をチェックするためのシンプルなビュー (既存)"""
    return JsonResponse({"status": "API is running and URLs are configured correctly"}, status=200)

# --------------------------------------------------------------------------
# 1. アダルト商品データ API ビュー (AdultProduct)
# --------------------------------------------------------------------------

class AdultProductListAPIView(generics.ListAPIView):
    """
    アダルト商品リストを取得するためのビュー (/api/adults/)
    """
    queryset = AdultProduct.objects.all().prefetch_related('maker', 'label', 'director', 'series', 'genres', 'actresses')
    serializer_class = AdultProductSerializer

class AdultProductDetailAPIView(generics.RetrieveAPIView):
    """
    特定のユニークIDを持つアダルト商品を取得するためのビュー (/api/adults/<product_id_unique>/)
    """
    queryset = AdultProduct.objects.all().prefetch_related('maker', 'label', 'director', 'series', 'genres', 'actresses')
    serializer_class = AdultProductSerializer
    lookup_field = 'product_id_unique'


# --------------------------------------------------------------------------
# 2. Linkshare商品データ API ビュー
# --------------------------------------------------------------------------

# ★★★ 修正: クラス名を LinkshareProductListAPIView にリネーム ★★★
class LinkshareProductListAPIView(generics.ListAPIView): 
    """
    LinkShare商品リストを取得するためのビュー (/api/linkshare/)
    """
    # ★ 修正: LinkshareProduct モデルを参照
    queryset = LinkshareProduct.objects.all()
    
    # ★ 修正: LinkshareProductSerializer を使用
    serializer_class = LinkshareProductSerializer

# ★★★ 修正: クラス名を LinkshareProductDetailAPIView にリネーム ★★★
class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    """
    特定のSKUを持つLinkShare商品を取得するためのビュー (/api/linkshare/<sku>/)
    """
    # ★ 修正: LinkshareProduct モデルを参照
    queryset = LinkshareProduct.objects.all()
    
    # ★ 修正: LinkshareProductSerializer を使用
    serializer_class = LinkshareProductSerializer
    
    # ★ 修正: URLパスで指定されるフィールドを LinkshareProductのSKUフィールド 'sku' に変更
    # (LinkshareProductでは sku_uniqueではなく sku がデータフィールドとして存在します)
    lookup_field = 'sku'