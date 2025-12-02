# api/serializers.py

from rest_framework import serializers
# Productだけでなく、ネストするエンティティモデルもすべてインポート
from .models import Product, Maker, Genre, Actress, Label, Director 

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

# ★ 補足: LabelとDirectorもネストする可能性があるため追加
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
        
# --------------------------------------------------------------------------
# Productモデルのメインシリアライザ
# --------------------------------------------------------------------------

class ProductSerializer(serializers.ModelSerializer):
    # ForeignKey (単一リレーション) はネストして表示
    maker = MakerSerializer(read_only=True)
    # LabelとDirectorもForeignKeyであれば追加
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    
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
            'api_source', # api_sourceも通常公開します
            
            # リレーション (ネストされたオブジェクト)
            'maker',
            'label',      # ★追加: Label
            'director',   # ★追加: Director
            'genres',
            'actresses',
            
            'is_active',
            'updated_at',
        )