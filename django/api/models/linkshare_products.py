from django.db import models
from django.utils import timezone

# ==========================================================================
# 4. LinkShare商品マスタモデル (LinkshareProduct)
# - 既存の normal_product テーブルを参照
# ==========================================================================

class LinkshareProduct(models.Model):
    # Django標準/必須フィールド
    id = models.BigAutoField(primary_key=True, verbose_name="ID")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")
    
    # 【変更箇所 1: sku_unique フィールドを削除】
    # ❌ 以前のコード: sku_unique = models.CharField(max_length=255, unique=True, ...)
    
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
    
    # 既存の結合キーやインデックスに必要なフィールド
    # これらのフィールドの組み合わせで一意性を担保します。
    merchant_id = models.CharField(
        max_length=32, 
        db_index=True, 
        verbose_name="マーチャントID (MID)",
        default='0000'
    )
    sku = models.CharField(
        max_length=256, 
        db_index=True, 
        verbose_name="SKU",
        default='NON-SKU'
    )
    
    # DBスキーマに合わせて affiliate_url を追加
    affiliate_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="アフィリエイトURL")
    
    # product_url
    product_url = models.URLField(
        max_length=2048, 
        null=True, 
        blank=True, 
        verbose_name="商品URL",
        default=''
    )
    
    # ----------------------------------------------------------------------
    
    def __str__(self):
        # ユニークキーとして sku_unique を使用しないため、fallback は f"{self.merchant_id}-{self.sku}" が適切です
        # product_name が存在しない場合のフォールバックとして、MIDとSKUの組み合わせを使用
        return self.product_name or f"{self.merchant_id}-{self.sku}" or f"Product ID: {self.id}"

    class Meta:
        db_table = 'normal_product'
        verbose_name = 'LinkShare商品マスタ'
        verbose_name_plural = 'LinkShare商品マスタ一覧'
        
        # 【変更箇所 2: 複合ユニーク制約の追加】
        constraints = [
            models.UniqueConstraint(
                fields=['merchant_id', 'sku'], 
                name='unique_mid_sku_combination' # 新しい制約名
            )
        ]
        
        # 既存のインデックスも維持
        indexes = [
            models.Index(fields=['merchant_id', 'updated_at'], name='normal_prod_merchan_f783d0_idx'),
        ]