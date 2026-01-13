from rest_framework import serializers
from .models import AdultProduct, LinkshareProduct, Maker, Genre, Actress, Label, Director, Series 
from .models.pc_products import PCProduct, PCAttribute  # 💡 PCAttribute を追加

# --------------------------------------------------------------------------
# 1. エンティティ（マスターデータ）のシリアライザ
# --------------------------------------------------------------------------

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

# 💡 新規追加: PCスペック属性用のシリアライザ
class PCAttributeSerializer(serializers.ModelSerializer):
    # attr_type の表示名（例: "cpu" -> "CPU"）を取得
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)

    class Meta:
        model = PCAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')

# --------------------------------------------------------------------------
# 2. アダルト商品モデル (AdultProductSerializer)
# --------------------------------------------------------------------------

class AdultProductSerializer(serializers.ModelSerializer): 
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)

    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'title', 'release_date',
            'affiliate_url', 'price', 'image_url_list', 'api_source',
            'maker', 'label', 'director', 'series', 'genres', 'actresses',
            'is_active', 'updated_at',
        )
        read_only_fields = fields 

# --------------------------------------------------------------------------
# 3. Linkshare商品モデル (LinkshareProductSerializer)
# --------------------------------------------------------------------------

class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct 
        fields = (
            'id', 'sku', 'product_name', 'availability', 
            'affiliate_url', 'image_url', 'merchant_id', 'updated_at',
        )
        read_only_fields = fields

# --------------------------------------------------------------------------
# 4. PC製品モデル (PCProductSerializer) - 🚀 属性連携対応版
# --------------------------------------------------------------------------

class PCProductSerializer(serializers.ModelSerializer):
    """
    最新の PCProduct モデル（AI解説、スペック属性タグ、統合ジャンル、在庫ステータス対応）用
    """
    # 🚀 スペック属性タグをネストして取得 (Many-to-Many なので many=True)
    attributes = PCAttributeSerializer(many=True, read_only=True)

    class Meta:
        model = PCProduct
        fields = (
            'id',
            'unique_id',           # 固有ID
            'site_prefix',         # 'lenovo', 'hp' 等
            'maker',               # メーカー名
            'raw_genre',           # サイト別分類
            'unified_genre',       # 統合ジャンル
            'name',                # 商品名
            'price',               # 価格
            'url',                 # 商品URL
            'image_url',           # 画像URL
            'description',         # 詳細スペック
            'attributes',          # 🚀 追記: スペック属性タグリスト
            'affiliate_url',       # 正式アフィリエイトURL
            'affiliate_updated_at',# URL更新日時
            'stock_status',        # 在庫/受注状況
            'ai_content',          # AI解説
            'is_posted',           # 投稿フラグ
            'is_active',           # 掲載フラグ
            'created_at',
            'updated_at',
        )
        read_only_fields = fields