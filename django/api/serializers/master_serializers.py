# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import Maker, Genre, Actress, Label, Director, Series
from api.models.pc_products import PCAttribute

class MakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maker
        fields = ('id', 'name', 'api_source', 'product_count')

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'name', 'api_source', 'product_count')

class ActressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actress
        fields = ('id', 'name', 'api_source', 'product_count')

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ('id', 'name', 'api_source', 'product_count')

class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = ('id', 'name', 'api_source', 'product_count')

class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = ('id', 'name', 'api_source', 'product_count')

class PCAttributeSerializer(serializers.ModelSerializer):
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
    class Meta:
        model = PCAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')