# api/views.py

from django.http import JsonResponse
from rest_framework import generics

# ★★★ 修正: Product, ProductSerializer のインポートを修正 ★★★
from .serializers import AdultProductSerializer, NormalProductSerializer 
from .models import AdultProduct, NormalProduct

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
            "adult_products_list": "/api/adults/", # ★ 変更: エンドポイント名をアダルト系に合わせる
            "normal_products_list": "/api/normals/", # ★ 追加: ノーマル系エンドポイント
            "product_detail": "/api/adults/{id}/"
        }
    }, status=200)

def status_check(request):
    """APIの状態をチェックするためのシンプルなビュー (既存)"""
    return JsonResponse({"status": "API is running and URLs are configured correctly"}, status=200)

# --------------------------------------------------------------------------
# 1. アダルト商品データ API ビュー (旧 Product)
# --------------------------------------------------------------------------

class AdultProductListAPIView(generics.ListAPIView): # ★ 修正: AdultProductListAPIView にリネーム
    """
    アダルト商品リストを取得するためのビュー (/api/adults/)
    """
    # ★ 修正: AdultProduct モデルを参照
    queryset = AdultProduct.objects.all().prefetch_related('maker', 'label', 'director', 'series', 'genres', 'actresses')
    
    # ★ 修正: AdultProductSerializer を使用
    serializer_class = AdultProductSerializer
    
    # ページネーション、フィルタリング、検索などをここに追加できます

class AdultProductDetailAPIView(generics.RetrieveAPIView): # ★ 修正: AdultProductDetailAPIView にリネーム
    """
    特定のユニークIDを持つアダルト商品を取得するためのビュー (/api/adults/<product_id_unique>/)
    """
    # ★ 修正: AdultProduct モデルを参照
    queryset = AdultProduct.objects.all().prefetch_related('maker', 'label', 'director', 'series', 'genres', 'actresses')
    
    # ★ 修正: AdultProductSerializer を使用
    serializer_class = AdultProductSerializer
    
    # URLパスで指定されるフィールドを 'pk' の代わりに 'product_id_unique' に変更
    lookup_field = 'product_id_unique'


# --------------------------------------------------------------------------
# 2. ノーマル商品データ API ビュー (新規追加)
# --------------------------------------------------------------------------

class NormalProductListAPIView(generics.ListAPIView):
    """
    ノーマル商品リストを取得するためのビュー (/api/normals/)
    """
    # ★ 新規追加: NormalProduct モデルを参照
    queryset = NormalProduct.objects.all()
    
    # ★ 新規追加: NormalProductSerializer を使用
    serializer_class = NormalProductSerializer
    
    # ページネーション、フィルタリング、検索などをここに追加できます

class NormalProductDetailAPIView(generics.RetrieveAPIView):
    """
    特定のユニークIDを持つノーマル商品を取得するためのビュー (/api/normals/<sku_unique>/)
    """
    # ★ 新規追加: NormalProduct モデルを参照
    queryset = NormalProduct.objects.all()
    
    # ★ 新規追加: NormalProductSerializer を使用
    serializer_class = NormalProductSerializer
    
    # URLパスで指定されるフィールドを 'sku_unique' に変更
    lookup_field = 'sku_unique'