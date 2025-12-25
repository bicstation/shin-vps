from django.db import models

class BcLinkshareProduct(models.Model):
    """
    Bic-saving(BC)専用: LinkShare APIから取得した商品データを保存するモデル
    """
    # 基本識別子
    linkid = models.CharField(max_length=255, unique=True, db_index=True, verbose_name="リンクID")
    mid = models.CharField(max_length=32, db_index=True, verbose_name="マーチャントID")
    merchant_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="マーチャント名")
    
    # 検索・表示用フィールド（APIから抽出）
    product_name = models.CharField(max_length=2048, null=True, blank=True, verbose_name="商品名")
    sku = models.CharField(max_length=256, db_index=True, null=True, blank=True, verbose_name="SKU")
    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="価格")
    
    # リンク・画像
    product_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="商品URL")
    affiliate_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="アフィリエイトURL")
    image_url = models.URLField(max_length=2048, null=True, blank=True, verbose_name="画像URL")

    # データ管理
    api_response_json = models.JSONField(verbose_name="APIレスポンス生データ")
    api_source = models.CharField(max_length=50, default='Linkshare-BC-API', verbose_name="取得ソース")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        db_table = 'bc_linkshare_product'  # テーブル名に bc_ を付与
        verbose_name = 'BC LinkShare商品'
        verbose_name_plural = 'BC LinkShare商品一覧'
        indexes = [
            models.Index(fields=['mid', 'updated_at']),
        ]

    def __str__(self):
        return f"[{self.mid}] {self.product_name or self.linkid}"