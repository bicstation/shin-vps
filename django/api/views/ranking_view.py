# api/views/ranking_view.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from api.models.product import Product
from api.serializers.product_serializer import ProductSerializer


class RankingAPIView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []  # ← これ重要（401対策）

    def get(self, request):
        
        products = list(
            Product.objects.filter(
                is_active=True,
                is_visible=True
            )
            .prefetch_related('attributes')
            .order_by('-ranking_score')[:50]  # ← 上位だけ
        )

        # rank付与
        for i, p in enumerate(products, start=1):
            p.rank = i

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)