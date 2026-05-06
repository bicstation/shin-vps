from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from api.utils.finder_engine import (
    find_semantic_products
)


class SemanticFinderView(APIView):

    permission_classes = [
        AllowAny
    ]

    def post(self, request):

        request_data = request.data

        # =====================================
        # semantic finder
        # =====================================
        finder_data = find_semantic_products(
            request_data
        )

        results = finder_data[
            "results"
        ]

        response_data = []

        for item in results:

            product = item["product"]

            response_data.append({

                "product": {

                    "id": product.id,

                    "unique_id": product.unique_id,

                    "name": product.name,

                    "price": product.price,

                    "image_url": product.image_url,
                },

                "semantic": {

                    "score": item["score"],

                    "confidence": item[
                        "confidence"
                    ],

                    "reasons": item[
                        "reasons"
                    ],

                    "breakdown": item[
                        "breakdown"
                    ],
                }
            })

        return Response({

            "meta": finder_data[
                "meta"
            ],

            "results": response_data,
        })