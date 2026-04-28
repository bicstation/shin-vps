from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

from api.models.product import Product
from api.serializers.product_serializer import ProductSerializer


@method_decorator(cache_page(60 * 10), name='dispatch')
class RankingView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        products = (
            Product.objects
            .filter(
                is_active=True,
                is_visible=True,
                is_adult=False
            )
            .prefetch_related('genres', 'actresses')
            .order_by('-ranking_score')[:10]
        )

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)