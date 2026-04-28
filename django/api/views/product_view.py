from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from api.models.product import Product
from api.serializers.product_serializer import ProductSerializer


class ProductRankingView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        qs = Product.objects.all()[:10]
        serializer = ProductSerializer(qs, many=True)
        return Response(serializer.data)