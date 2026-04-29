# api/views/ranking_view.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from api.models.product import Product
from api.serializers.product_serializer import ProductSerializer

class RankingAPIView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):

        qs = Product.objects.filter(
            is_active=True,
            is_visible=True
        ).exclude(
            title__icontains="モニター"
        ).exclude(
            title__icontains="monitor"
        ).exclude(
            title__icontains="server"
        ).exclude(
            title__icontains="poweredge"
        ).prefetch_related(
            'attributes'
        ).order_by('-ranking_score')[:10]

        products = list(qs)

        # rank付与（重要）
        for i, p in enumerate(products, start=1):
            p.rank = i

        # serializer = ProductSerializer(products, many=True)
        serializer = ProductSerializer(products, many=True, context={"request": request})
        return Response(serializer.data)