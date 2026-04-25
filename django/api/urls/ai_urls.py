from django.urls import path
from api.views.image_generate import generate_image_api

urlpatterns = [
    path('generate-image/', generate_image_api),
]