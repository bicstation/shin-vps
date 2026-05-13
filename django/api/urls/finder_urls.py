# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/urls/finder_urls.py

from django.urls import path

from api.views.finder_view import (
    finder_recommend
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "finder"

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    # ==========================================================================
    # 🧠 Semantic Recommendation Finder
    # ==========================================================================

    path(
        "recommend/",
        finder_recommend,
        name="recommend",
    ),
]