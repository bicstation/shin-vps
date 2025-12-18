# api/serializers.py

from rest_framework import serializers
from .models import AdultProduct, LinkshareProduct, Maker, Genre, Actress, Label, Director, Series 

# --------------------------------------------------------------------------
## 1. エンティティ（マスターデータ）のシリアライザ
# --------------------------------------------------------------------------

class MakerSerializer(serializers.ModelSerializer):
    """Makerモデル用のシリアライザ (既存のproduct_countカラムを表示)"""
    class Meta:
        model = Maker
        fields = ('id', 'name', 'api_source', 'product_count')

class GenreSerializer(serializers.ModelSerializer):
    """Genreモデル用のシリアライザ (既存のproduct_countカラムを表示)"""
    class Meta:
        model = Genre
        fields = ('id', 'name', 'api_source', 'product_count')

class ActressSerializer(serializers.ModelSerializer):
    """Actressモデル用のシリアライザ (既存のproduct_countカラムを表示)"""
    class Meta:
        model = Actress
        fields = ('id', 'name', 'api_source', 'product_count')

class LabelSerializer(serializers.ModelSerializer):
    """Labelモデル用のシリアライザ (既存のproduct_countカラムを表示)"""
    class Meta:
        model = Label
        fields = ('id', 'name', 'api_source', 'product_count')

class DirectorSerializer(serializers.ModelSerializer):
    """Directorモデル用のシリアライザ (既存のproduct_countカラムを表示)"""
    class Meta:
        model = Director
        fields = ('id', 'name', 'api_source', 'product_count')
        
class SeriesSerializer(serializers.ModelSerializer):
    """Seriesモデル用のシリアライザ (既存のproduct_countカラムを表示)"""
    class Meta:
        model = Series
        fields = ('id', 'name', 'api_source', 'product_count')
        
# --------------------------------------------------------------------------
## 2. アダルト商品モデルのメインシリアライザ (AdultProductSerializer)
# --------------------------------------------------------------------------

class AdultProductSerializer(serializers.ModelSerializer): 
    
    # ForeignKey (単一リレーション) はネストして表示
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    
    # ManyToManyField (複数リレーション) はネストして表示
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)

    class Meta:
        model = AdultProduct 
        # APIで公開するフィールドを指定
        fields = (
            'id', 
            'product_id_unique', 
            'title', 
            'release_date',
            'affiliate_url',
            'price',
            'image_url_list',
            'api_source',
            
            # リレーション (ネストされたオブジェクト)
            'maker',
            'label',
            'director',
            'series', 
            'genres',
            'actresses',
            
            'is_active',
            'updated_at',
        )
        # 読み取り専用APIとして利用する場合、安全のため fields 全体を read_only に指定
        read_only_fields = fields 

# --------------------------------------------------------------------------
## 3. Linkshare商品モデルのメインシリアライザ (LinkshareProductSerializer)
# --------------------------------------------------------------------------

class LinkshareProductSerializer(serializers.ModelSerializer):
    """
    LinkshareProductモデル用のシンプルなシリアライザ
    """
    class Meta:
        model = LinkshareProduct 
        # NormalProductモデルで定義したフィールドを公開
        fields = (
            'id',
            'sku', 
            'product_name', 
            'sale_price', 
            'availability', 
            'affiliate_url',
            'image_url',
            'merchant_id', 
            'updated_at',
        )
        # 読み取り専用APIとして利用する場合、安全のため fields 全体を read_only に指定
        read_only_fields = fields