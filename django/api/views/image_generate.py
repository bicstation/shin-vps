from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from api.services.image_generator import generate_image

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])

def generate_image_api(request):
    try:
        print("🔥🔥🔥 HIT generate_image_api 🔥🔥🔥")
        title = request.data.get("title")
        content = request.data.get("content")

        if not title:
            return Response({
                "error": "title is required"
            }, status=400)

        print("🚀 generate_image start")
        print("title:", title)

        image_path = generate_image(title, content)

        print("✅ generated:", image_path)

        if not image_path:
            return Response({
                "error": "image generation failed"
            }, status=500)

        return Response({
            "imagePath": image_path
        })

    except Exception as e:
        import traceback
        traceback.print_exc()

        return Response({
            "error": str(e)
        }, status=500)