# api/serializers.py

from rest_framework import serializers
# 修正されたモデル名 (AdultProduct, NormalProduct, Series) をインポート
from .models import AdultProduct, NormalProduct, Maker, Genre, Actress, Label, Director, Series 

# --------------------------------------------------------------------------
## 1. エンティティのネストされたシリアライザ
# --------------------------------------------------------------------------

class MakerSerializer(serializers.ModelSerializer):
    """Makerモデル用のシンプルなシリアライザ"""
    class Meta:
        model = Maker
        fields = ('id', 'name', 'api_source')

class GenreSerializer(serializers.ModelSerializer):
    """Genreモデル用のシンプルなシリアライザ (api_sourceを追加)"""
    class Meta:
        model = Genre
        fields = ('id', 'name', 'api_source') # api_sourceを追加

class ActressSerializer(serializers.ModelSerializer):
    """Actressモデル用のシンプルなシリアライザ (api_sourceを追加)"""
    class Meta:
        model = Actress
        fields = ('id', 'name', 'api_source') # api_sourceを追加

class LabelSerializer(serializers.ModelSerializer):
    """Labelモデル用のシンプルなシリアライザ"""
    class Meta:
        model = Label
        fields = ('id', 'name', 'api_source')

class DirectorSerializer(serializers.ModelSerializer):
    """Directorモデル用のシンプルなシリアライザ"""
    class Meta:
        model = Director
        fields = ('id', 'name', 'api_source')
        
class SeriesSerializer(serializers.ModelSerializer):
    """Seriesモデル用のシンプルなシリアライザ"""
    class Meta:
        model = Series
        fields = ('id', 'name', 'api_source')
        
# --- 【修正点】: Python構文エラーの原因となる --- をコメントアウト
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

# --- 【修正点】: Python構文エラーの原因となる --- をコメントアウト
# --------------------------------------------------------------------------
## 3. ノーマル商品モデルのメインシリアライザ (NormalProductSerializer)
# --------------------------------------------------------------------------

class NormalProductSerializer(serializers.ModelSerializer):
    """
    NormalProductモデル用のシンプルなシリアライザ
    """
    class Meta:
        model = NormalProduct
        # NormalProductモデルで定義したフィールドを公開
        fields = (
            'id',
            'sku_unique',
            'title',
            'price',
            'in_stock',
            'affiliate_url',
            'image_url',
            'api_source',
            'is_active',
            'updated_at',
        )
        # 読み取り専用APIとして利用する場合、安全のため fields 全体を read_only に指定
        read_only_fields = fields