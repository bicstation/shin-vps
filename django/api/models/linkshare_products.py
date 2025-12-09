# api/models/linkshare_products.py

from django.db import models
from django.utils import timezone

# ==========================================================================
# 4. LinkShare商品マスタモデル (LinkshareProduct)
#    - 既存の normal_product テーブルを参照
# ==========================================================================

class LinkshareProduct(models.Model):
    # LinkshareProductのフィールド定義（LinkShareの38項目に対応）
    merchant_id = models.CharField(max_length=32, db_index=True, verbose_name="マーチャントID (MID)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    link_id = models.CharField(max_length=128, db_index=True, verbose_name="リンクID")
    product_name = models.CharField(max_length=512, verbose_name="商品名")
    sku = models.CharField(max_length=256, db_index=True, verbose_name="SKU")
    primary_category = models.CharField(max_length=255, null=True, blank=True, verbose_name="主カテゴリ")
    sub_category = models.TextField(null=True, blank=True, verbose_name="サブカテゴリ")
    
    # 🚨 修正箇所: null=True, blank=True を追加して NOT NULL 制約違反を解消 🚨
    product_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="商品URL")
    
    image_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="商品画像URL")
    buy_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="購買URL")
    short_description = models.TextField(null=True, blank=True, verbose_name="商品概要")
    description = models.TextField(null=True, blank=True, verbose_name="商品詳細")
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="値引金額/率")
    discount_type = models.CharField(max_length=50, null=True, blank=True, verbose_name="値引種別")
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="販売価格")
    retail_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="定価")
    begin_date = models.DateTimeField(null=True, blank=True, verbose_name="リンク有効日")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="リンク無効日")
    brand_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="ブランド名")
    shipping = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="送料")
    keywords = models.TextField(null=True, blank=True, verbose_name="キーワード")
    manufacturer_part_number = models.CharField(max_length=255, null=True, blank=True, verbose_name="製造品番")
    manufacturer_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="メーカー名")
    shipping_information = models.CharField(max_length=255, null=True, blank=True, verbose_name="配送追加情報")
    availability = models.CharField(max_length=255, null=True, blank=True, verbose_name="在庫情報")
    universal_product_code = models.CharField(max_length=50, null=True, blank=True, verbose_name="JAN/UPC")
    class_id = models.CharField(max_length=50, null=True, blank=True, verbose_name="追加属性コード")
    currency = models.CharField(max_length=10, default='JPY', verbose_name="通貨")
    m1 = models.CharField(max_length=2000, null=True, blank=True, verbose_name="M1")
    pixel_url = models.CharField(max_length=512, null=True, blank=True, verbose_name="Pixel URL")
    attribute_1 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性1")
    attribute_2 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性2")
    attribute_3 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性3")
    attribute_4 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性4")
    attribute_5 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性5")
    attribute_6 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性6")
    attribute_7 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性7")
    attribute_8 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性8")
    attribute_9 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性9")
    attribute_10 = models.CharField(max_length=255, null=True, blank=True, verbose_name="追加属性10")

    class Meta:
        # ここを既存のテーブル名に合わせる
        db_table = 'normal_product'
        verbose_name = 'LinkShare商品マスタ'
        verbose_name_plural = 'LinkShare商品マスタ一覧'
        unique_together = (('merchant_id', 'sku'),)
        indexes = [
            models.Index(fields=['merchant_id', 'updated_at'], name='normal_prod_merchan_f783d0_idx'),
        ]

    def __str__(self):
        return self.product_name