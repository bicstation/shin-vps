from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from api.models.product import Product
from api.serializers.product_serializer import ProductSerializer


# -------------------------
# ランキングAPI
# -------------------------
class ProductRankingView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):

        qs = Product.objects.filter(
            is_active=True,
            is_visible=True
        ).order_by('-ranking_score')[:10]

        products = list(qs)

        # 🔥 rank付与
        for i, p in enumerate(products, start=1):
            p.rank = i

        serializer = ProductSerializer(
            products,
            many=True,
            context={"request": request}  # ← これ重要（画像URL安定）
        )
        return Response(serializer.data)


# -------------------------
# 🔥 詳細API
# -------------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_detail(request, unique_id):
    try:
        product = Product.objects.select_related('pc_product').get(
            unique_id=unique_id,
            is_active=True,
            is_visible=True
        )
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    # 🔥 未紐付け対策
    if not product.pc_product:
        return Response({
            "error": "pc_product not linked",
            "unique_id": product.unique_id
        }, status=404)

    # -------------------------
    # 🔥 画像処理（完全版）
    # -------------------------
    image_url = ""

    if product.image_local:
        try:
            image_url = product.image_local.url
        except Exception:
            image_url = ""

    if not image_url:
        image_url = product.image_source or "/static/no-image.png"

    # 絶対URL化（重要）
    if image_url.startswith("/"):
        image_url = request.build_absolute_uri(image_url)

    # -------------------------
    # レスポンス
    # -------------------------
    return Response({
        "unique_id": product.unique_id,
        "title": product.title,
        "image": image_url,
        "price": product.price,
        "url": product.affiliate_url,
        "maker": product.maker,
        "tags": [a.name for a in product.attributes.all()],
    })