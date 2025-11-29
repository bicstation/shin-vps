from rest_framework import serializers
from .models import Product, Maker, Genre, Actress

# --------------------------------------------------------------------------
# エンティティのネストされたシリアライザ
# --------------------------------------------------------------------------

class MakerSerializer(serializers.ModelSerializer):
    """Makerモデル用のシンプルなシリアライザ"""
    class Meta:
        model = Maker
        fields = ('id', 'name', 'api_source')

class GenreSerializer(serializers.ModelSerializer):
    """Genreモデル用のシンプルなシリアライザ"""
    class Meta:
        model = Genre
        fields = ('id', 'name')

class ActressSerializer(serializers.ModelSerializer):
    """Actressモデル用のシンプルなシリアライザ"""
    class Meta:
        model = Actress
        fields = ('id', 'name')

# --------------------------------------------------------------------------
# Productモデルのメインシリアライザ
# --------------------------------------------------------------------------

class ProductSerializer(serializers.ModelSerializer):
    # ForeignKey (単一リレーション) はネストして表示
    maker = MakerSerializer(read_only=True)
    
    # ManyToManyField (複数リレーション) はネストして表示
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        # APIで公開するフィールドを指定
        fields = (
            'id', 
            'product_id_unique', 
            'title', 
            'release_date',
            'affiliate_url',
            'price',
            'image_url_list',
            # リレーション
            'maker',
            'genres',
            'actresses',
            'is_active',
            'updated_at',
        )