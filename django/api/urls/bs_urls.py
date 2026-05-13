# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/bs_urls.py

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from api.views.bs_views import (

    BSDeviceViewSet,

    BSMobilePlanViewSet,

    BSCarrierViewSet,
)

# ==============================================================================
# 🚀 Namespace
# ==============================================================================

app_name = "bs"

# ==============================================================================
# 🚀 DRF Router
# ==============================================================================

router = DefaultRouter()

# ------------------------------------------------------------------------------
# 📱 Devices
# ------------------------------------------------------------------------------

router.register(
    r'devices',
    BSDeviceViewSet,
    basename='device'
)

# ------------------------------------------------------------------------------
# 📦 Mobile Plans
# ------------------------------------------------------------------------------

router.register(
    r'plans',
    BSMobilePlanViewSet,
    basename='plan'
)

# ------------------------------------------------------------------------------
# 📡 Carriers
# ------------------------------------------------------------------------------

router.register(
    r'carriers',
    BSCarrierViewSet,
    basename='carrier'
)

# ==============================================================================
# 🚀 URL Patterns
# ==============================================================================

urlpatterns = [

    path(
        '',
        include(router.urls)
    ),
]