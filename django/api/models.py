from django.db import models
from django.utils import timezone

# --------------------------------------------------------------------------
# 1. API生データモデル (RawApiData)
# --------------------------------------------------------------------------

class RawApiData(models.Model):
    """
    FANZAやDUGAなどのAPIから取得した生データをそのまま格納するモデル。
    """
    API_CHOICES = [
        ('DUGA', 'DUGA API'),
        ('FANZA', 'FANZA API'),
    ]

    api_source = models.CharField(max_length=10, choices=API_CHOICES, verbose_name="APIソース")
    api_product_id = models.CharField(max_length=255, verbose_name="API商品ID")
    raw_json_data = models.JSONField(verbose_name="生JSONデータ")
    
    # スクリプトに登場しないが、データに紐づく可能性のあるフィールド
    api_service = models.CharField(max_length=50, null=True, blank=True, verbose_name="APIサービスコード")
    api_floor = models.CharField(max_length=50, null=True, blank=True, verbose_name="APIフロアコード")

    # 追跡用フィールド
    # ✅ 移行状態を追跡するための 'migrated' フィールドを追加
    migrated = models.BooleanField(default=False, verbose_name="移行済み") 
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    
    class Meta:
        db_table = 'raw_api_data'
        verbose_name = 'API生データ'
        verbose_name_plural = 'API生データ一覧'
        # APIソースと商品IDの組み合わせで一意性を保証
        unique_together = ('api_source', 'api_product_id')

    def __str__(self):
        return f"{self.api_source}: {self.api_product_id}"


# --------------------------------------------------------------------------
# 2. エンティティモデル群の基底クラス (EntityBase)
# --------------------------------------------------------------------------

class EntityBase(models.Model):
    """
    メーカー、ジャンル、女優などの共通フィールドを持つ基底クラス
    """
    api_source = models.CharField(max_length=10, verbose_name="APIソース (DUGA/FANZA)")
    api_id = models.CharField(max_length=255, null=True, blank=True, unique=False, verbose_name="API固有ID")
    name = models.CharField(max_length=255, verbose_name="名称")
    product_count = models.IntegerField(default=0, verbose_name="関連商品数")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        abstract = True
        # PostgreSQLでapi_sourceとnameの組み合わせがユニークであることを保証する
        unique_together = (('api_source', 'name'),)
        ordering = ['name']

    def __str__(self):
        return f"[{self.api_source}] {self.name}"

class Maker(EntityBase):
    """メーカー"""
    class Meta(EntityBase.Meta):
        db_table = 'maker'
        verbose_name = 'メーカー'
        verbose_name_plural = 'メーカー一覧'

class Label(EntityBase):
    """レーベル"""
    class Meta(EntityBase.Meta):
        db_table = 'label'
        verbose_name = 'レーベル'
        verbose_name_plural = 'レーベル一覧'

class Genre(EntityBase):
    """ジャンル/カテゴリ"""
    class Meta(EntityBase.Meta):
        db_table = 'genre'
        verbose_name = 'ジャンル'
        verbose_name_plural = 'ジャンル一覧'

class Actress(EntityBase):
    """女優/出演者"""
    class Meta(EntityBase.Meta):
        db_table = 'actress'
        verbose_name = '女優'
        verbose_name_plural = '女優一覧'

class Director(EntityBase):
    """監督"""
    class Meta(EntityBase.Meta):
        db_table = 'director'
        verbose_name = '監督'
        verbose_name_plural = '監督一覧'

# Series モデル
class Series(EntityBase):
    """シリーズ (FANZAの「シリーズ名」に対応)"""
    class Meta(EntityBase.Meta):
        db_table = 'series'
        verbose_name = 'シリーズ'
        verbose_name_plural = 'シリーズ一覧'


# --------------------------------------------------------------------------
# 3. 商品モデル (Product)
# --------------------------------------------------------------------------

class Product(models.Model):
    """
    正規化され、アプリケーションで使用される商品データ。
    複数のAPIソースのデータを統合・整形して格納する。
    """
    # 外部キー: どの生データから生成されたか追跡する
    raw_data = models.ForeignKey(
        RawApiData,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name="生データソース"
    )

    # 必須フィールド
    api_source = models.CharField(max_length=10, verbose_name="APIソース (DUGA/FANZA)")
    
    # ★★★ 修正: api_product_id フィールドを追加 ★★★
    api_product_id = models.CharField(
        max_length=255, 
        verbose_name="API提供元製品ID",
        # NOTE: unique=True は product_id_unique が担うため、ここでは不要
    )
    
    product_id_unique = models.CharField(max_length=255, unique=True, verbose_name="統合ID")
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    release_date = models.DateField(null=True, blank=True, verbose_name="公開日")
    
    # リンク・価格
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    price = models.IntegerField(null=True, blank=True, verbose_name="販売価格 (円)")

    # 画像
    image_url_list = models.JSONField(default=list, verbose_name="画像URLリスト")

    # リレーション (単一/ForeignKey)
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_made', verbose_name="メーカー")
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_labeled', verbose_name="レーベル")
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_directed', verbose_name="監督")
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='products_in_series', verbose_name="シリーズ")

    # リレーション (複数/ManyToManyField)
    genres = models.ManyToManyField(Genre, related_name='products', verbose_name="ジャンル")
    actresses = models.ManyToManyField(Actress, related_name='products', verbose_name="出演者")
    
    # 追跡用フィールド
    is_active = models.BooleanField(default=True, verbose_name="有効/無効")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        db_table = 'product'
        verbose_name = '商品'
        verbose_name_plural = '商品一覧'
        ordering = ['-release_date']

    def __str__(self):
        return self.title