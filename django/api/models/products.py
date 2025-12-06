# api/models/products.py

from django.db import models
# ★修正: 外部参照するモデルをインポートする
from .raw_and_entities import RawApiData, Maker, Label, Director, Series, Genre, Actress 


# --------------------------------------------------------------------------
# 3. 商品モデル (AdultProduct)
# --------------------------------------------------------------------------

class AdultProduct(models.Model):
    """
    正規化された、アダルト系コンテンツ専用の商品データ。
    FANZA/DUGAのデータを統合・整形して格納する。
    """
    raw_data = models.ForeignKey(
        RawApiData,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='adult_products', 
        verbose_name="生データソース"
    )

    api_source = models.CharField(max_length=10, verbose_name="APIソース (DUGA/FANZA)")
    api_product_id = models.CharField(max_length=255, verbose_name="API提供元製品ID")
    product_id_unique = models.CharField(max_length=255, unique=True, verbose_name="統合ID")
    title = models.CharField(max_length=512, verbose_name="作品タイトル")
    release_date = models.DateField(null=True, blank=True, verbose_name="公開日")
    
    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    price = models.IntegerField(null=True, blank=True, verbose_name="販売価格 (円)")
    image_url_list = models.JSONField(default=list, verbose_name="画像URLリスト")

    # リレーション (単一/ForeignKey)
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_made', verbose_name="メーカー")
    label = models.ForeignKey(Label, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_labeled', verbose_name="レーベル")
    director = models.ForeignKey(Director, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_directed', verbose_name="監督")
    series = models.ForeignKey(Series, on_delete=models.SET_NULL, null=True, blank=True, related_name='adult_products_in_series', verbose_name="シリーズ")

    # リレーション (複数/ManyToManyField)
    genres = models.ManyToManyField(Genre, related_name='adult_products', verbose_name="ジャンル")
    actresses = models.ManyToManyField(Actress, related_name='adult_products', verbose_name="出演者")
    
    is_active = models.BooleanField(default=True, verbose_name="有効/無効")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        db_table = 'adult_product' 
        verbose_name = 'アダルト商品'
        verbose_name_plural = 'アダルト商品一覧'
        ordering = ['-release_date']

    def __str__(self):
        return self.title


# --------------------------------------------------------------------------
# 4. ノーマル商品モデル (NormalProduct)
# --------------------------------------------------------------------------

class NormalProduct(models.Model):
    """
    LinkShare APIなどから取得したノーマル商品専用のデータ。
    アダルト商品とは完全に分離して管理する。
    """
    api_source = models.CharField(max_length=20, default='LINKSHARE', verbose_name="APIソース")
    
    sku_unique = models.CharField(max_length=255, unique=True, verbose_name="SKU/統合ID")
    title = models.CharField(max_length=512, verbose_name="商品名")
    
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="販売価格 (円)")
    in_stock = models.BooleanField(default=True, verbose_name="在庫あり")

    affiliate_url = models.URLField(max_length=2048, verbose_name="アフィリエイトURL")
    image_url = models.URLField(max_length=2048, verbose_name="メイン画像URL")

    is_active = models.BooleanField(default=True, verbose_name="有効/無効")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        db_table = 'normal_product'
        verbose_name = 'ノーマル商品'
        verbose_name_plural = 'ノーマル商品一覧'
        ordering = ['-created_at']

    def __str__(self):
        return self.title