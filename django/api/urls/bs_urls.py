# -*- coding: utf-8 -*-
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.bs_views import BSDeviceViewSet, BSMobilePlanViewSet, BSCarrierViewSet

# 💡 app_name を設定することで、reverse('api:bs:device-list') のように呼べるようになります
app_name = 'bs'

router = DefaultRouter()
router.register(r'devices', BSDeviceViewSet, basename='device')
router.register(r'plans', BSMobilePlanViewSet, basename='plan')
router.register(r'carriers', BSCarrierViewSet, basename='carrier')

urlpatterns = [
    path('', include(router.urls)),
]