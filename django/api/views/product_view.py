from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from api.models.product import Product
from api.serializers.product_serializer import ProductSerializer


class ProductRankingView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):

        qs = Product.objects.filter(
            is_active=True,
            is_visible=True
        ).order_by('-ranking_score')[:10]

        products = list(qs)

        # 🔥 rank付与（最重要）
        for i, p in enumerate(products, start=1):
            p.rank = i

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)