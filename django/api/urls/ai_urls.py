# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/ai_urls.py

from django.urls import path

from api.views.image_generate import (
    generate_image_api
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "ai"

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🎨 AI Image Generation
    # ==========================================================================

    path(
        "generate-image/",
        generate_image_api,
        name="generate_image",
    ),
]