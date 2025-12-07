# api/serializers.py

from rest_framework import serializers
# ★★★ 修正: NormalProduct を LinkshareProduct に変更 ★★★
from .models import AdultProduct, LinkshareProduct, Maker, Genre, Actress, Label, Director, Series 

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
        fields = ('id', 'name', 'api_source')

class ActressSerializer(serializers.ModelSerializer):
    """Actressモデル用のシンプルなシリアライザ (api_sourceを追加)"""
    class Meta:
        model = Actress
        fields = ('id', 'name', 'api_source')

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
## 3. ノーマル商品モデルのメインシリアライザ (LinkshareProductSerializer)
# --------------------------------------------------------------------------

# ★★★ 修正: クラス名を LinkshareProductSerializer に変更 ★★★
class LinkshareProductSerializer(serializers.ModelSerializer):
    """
    LinkshareProductモデル用のシンプルなシリアライザ
    """
    class Meta:
        # ★★★ 修正: model を LinkshareProduct に変更 ★★★
        model = LinkshareProduct 
        # NormalProductモデルで定義したフィールドを公開
        fields = (
            'id',
            # 💡 LinkshareProductのフィールド名に合わせる
            'sku', 
            'product_name', 
            'sale_price', # 💡 LinkshareProductは sale_price を持つ
            'availability', # 💡 LinkshareProductは availability (在庫) を持つ
            'affiliate_url',
            'image_url',
            'merchant_id', # 💡 LinkshareProductは merchant_id を持つ
            'updated_at',
            # 管理用フィールドは省略し、LinkshareProductの核となるフィールドを表示
        )
        # 読み取り専用APIとして利用する場合、安全のため fields 全体を read_only に指定
        read_only_fields = fields