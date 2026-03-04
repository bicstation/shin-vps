# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models import BSCarrier, BSDevice, BSDeviceColor, BSDevicePrice, BSMobilePlan

class BSCarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = BSCarrier
        fields = '__all__'

class BSMobilePlanSerializer(serializers.ModelSerializer):
    carrier_name = serializers.ReadOnlyField(source='carrier.name')
    class Meta:
        model = BSMobilePlan
        fields = '__all__'

class BSDeviceColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = BSDeviceColor
        fields = ['color_name', 'color_code', 'image_url']

class BSDevicePriceSerializer(serializers.ModelSerializer):
    carrier_name = serializers.ReadOnlyField(source='carrier.name')
    class Meta:
        model = BSDevicePrice
        fields = ['carrier_name', 'total_price', 'program_price']

class BSDeviceSerializer(serializers.ModelSerializer):
    colors = BSDeviceColorSerializer(many=True, read_only=True)
    carrier_prices = BSDevicePriceSerializer(many=True, read_only=True)

    class Meta:
        model = BSDevice
        fields = '__all__'