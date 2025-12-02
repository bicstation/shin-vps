# api/views.py

from django.http import JsonResponse
from rest_framework import generics

# DRFのビューで使用するため、シリアライザとモデルをインポート
from .serializers import ProductSerializer 
from .models import Product

def status_check(request):
    """APIの状態をチェックするためのシンプルなビュー (既存)"""
    # 応答が成功したことを示すステータスコード 200 を返します
    return JsonResponse({"status": "API is running and URLs are configured correctly"}, status=200)

# --------------------------------------------------------------------------
# DRFを使用した商品データAPIビュー
# --------------------------------------------------------------------------

class ProductListAPIView(generics.ListAPIView):
    """
    全ての商品リストを取得するためのビュー (/api/products/)
    """
    # Productモデルからデータを取得。リレーションデータを効率的に取得するため prefetch_related を使用。
    queryset = Product.objects.all().prefetch_related('maker', 'label', 'director', 'genres', 'actresses')
    
    # 使用するシリアライザ
    serializer_class = ProductSerializer
    
    # ページネーション、フィルタリング、検索などをここに追加できます

class ProductDetailAPIView(generics.RetrieveAPIView):
    """
    特定のユニークIDを持つ商品を取得するためのビュー (/api/products/<product_id_unique>/)
    """
    # Productモデルからデータを取得。リレーションデータを効率的に取得するため prefetch_related を使用。
    queryset = Product.objects.all().prefetch_related('maker', 'label', 'director', 'genres', 'actresses')
    
    # 使用するシリアライザ
    serializer_class = ProductSerializer
    
    # URLパスで指定されるフィールドを 'pk' の代わりに 'product_id_unique' に変更
    # この設定を使用する場合、urls.py のパターンも <str:product_id_unique> に合わせる必要があります
    lookup_field = 'product_id_unique'