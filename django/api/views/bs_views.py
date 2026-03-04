# -*- coding: utf-8 -*-
from rest_framework import viewsets
# 💡 ここに BSMobilePlan と BSCarrier が足りていませんでした
from api.models import BSDevice, BSMobilePlan, BSCarrier 
# 💡 シリアライザーも同様です
from api.serializers import BSDeviceSerializer, BSMobilePlanSerializer, BSCarrierSerializer

class BSDeviceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    端末一覧および詳細を取得するためのAPIエンドポイント
    """
    # prefetch_related を使うことでDBへのアクセス回数を減らし高速化します
    queryset = BSDevice.objects.all().prefetch_related('colors', 'carrier_prices__carrier')
    serializer_class = BSDeviceSerializer
    
# 💡 これが足りなかったはずです！
class BSMobilePlanViewSet(viewsets.ReadOnlyModelViewSet):
    """通信プラン一覧・詳細"""
    queryset = BSMobilePlan.objects.all().select_related('carrier')
    serializer_class = BSMobilePlanSerializer

# 💡 これも urls/bs_urls.py でインポートしているので必要です
class BSCarrierViewSet(viewsets.ReadOnlyModelViewSet):
    """キャリア一覧・詳細"""
    queryset = BSCarrier.objects.all()
    serializer_class = BSCarrierSerializer