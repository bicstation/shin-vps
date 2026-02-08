# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import (
    Maker, Label, Director, Series, Genre, Actress, Author
)
from api.models.pc_products import PCAttribute

# --- 共通ベースシリアライザー ---
class BaseMasterSerializer(serializers.ModelSerializer):
    """
    マスターデータ（メーカー、女優、ジャンル等）の共通フィールド定義
    """
    class Meta:
        fields = ('id', 'name', 'ruby', 'api_source', 'product_count')
        read_only_fields = fields

# --- 各モデルのシリアライザー定義 ---

class MakerSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Maker

class LabelSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Label

class DirectorSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Director

class SeriesSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Series

class GenreSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Genre

class ActressSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Actress

class AuthorSerializer(BaseMasterSerializer):
    """
    🆕 FANZA Books/電子書籍等の著者用シリアライザー
    これがないと AdultProductSerializer での Import でエラーになります
    """
    class Meta(BaseMasterSerializer.Meta):
        model = Author

# --- PCパーツ/周辺機器 属性用 ---

class PCAttributeSerializer(serializers.ModelSerializer):
    """
    PCパーツ等の属性（CPU, メモリ等）用
    """
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)

    class Meta:
        model = PCAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')
        read_only_fields = fields