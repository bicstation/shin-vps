from django.http import JsonResponse
import json
from api.services.image_generator import generate_image

def generate_image_api(request):
    if request.method == "POST":
        body = json.loads(request.body)

        title = body.get("title")
        content = body.get("content")

        image_path = generate_image(title, content)

        return JsonResponse({
            "imagePath": image_path
        })