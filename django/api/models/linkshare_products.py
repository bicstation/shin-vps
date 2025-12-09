from django.db import models
from django.utils import timezone
# csv, io は不要になるため削除（もし他の場所で使われていなければ）
# import csv
# import io 

# ==========================================================================
# 4. LinkShare商品マスタモデル (LinkshareProduct)
# - 既存の normal_product テーブルを参照
# ==========================================================================

class LinkshareProduct(models.Model):
    # Django標準/必須フィールド
    id = models.BigAutoField(primary_key=True, verbose_name="ID")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    
    # 【検索・フィルタリングに必須のフィールド（最小限）】
    sku_unique = models.CharField(
        max_length=255, 
        unique=True, 
        db_index=True, 
        null=True, 
        blank=True, 
        verbose_name="ユニークSKU"
    )
    
    # 物理フィールド
    product_name = models.CharField(
        max_length=2048, 
        null=True, 
        blank=True, 
        verbose_name="商品名"
    )
    # -------------------------------------------------------------
    
    in_stock = models.BooleanField(default=True, null=True, blank=True, verbose_name="在庫")
    is_active = models.BooleanField(default=True, null=True, blank=True, verbose_name="有効フラグ") 
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name="通常価格"
    ) 
    merchant_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="マーチャント名")
    api_source = models.CharField(max_length=20, null=True, blank=True, verbose_name="APIソース")
    
    # 生データカラム
    raw_csv_data = models.TextField(null=True, blank=True, verbose_name="CSV生データ")
    
    # 既存の結合キーやインデックスに必要なフィールド (Default値の修正箇所 1/3, 2/3)
    merchant_id = models.CharField(
        max_length=32, 
        db_index=True, 
        verbose_name="マーチャントID (MID)",
        default='0000' # 👈 DBのNOT NULL定義に合わせた修正
    )
    sku = models.CharField(
        max_length=256, 
        db_index=True, 
        verbose_name="SKU",
        default='NON-SKU' # 👈 DBのNOT NULL定義に合わせた修正
    )
    
    # DBスキーマに合わせて affiliate_url を追加
    affiliate_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="アフィリエイトURL")
    
    # product_url はそのまま残す (Default値の修正箇所 3/3)
    product_url = models.URLField(
        max_length=2048, 
        null=True, 
        blank=True, 
        verbose_name="商品URL",
        default='' # 👈 DBのDefault ''::character varying に合わせた修正
    )
    
    # ----------------------------------------------------------------------
    # ❌ 削除: product_name を物理フィールドにしたため、@property は不要 ❌
    # ----------------------------------------------------------------------
    
    # ----------------------------------------------------------------------
    # __str__ メソッドの修正
    # ----------------------------------------------------------------------
    def __str__(self):
        # 物理フィールドとなった self.product_name を優先して返す
        return self.product_name or self.sku_unique or f"Product ID: {self.id}"

    class Meta:
        db_table = 'normal_product'
        verbose_name = 'LinkShare商品マスタ'
        verbose_name_plural = 'LinkShare商品マスタ一覧'
        indexes = [
            models.Index(fields=['merchant_id', 'updated_at'], name='normal_prod_merchan_f783d0_idx'),
        ]