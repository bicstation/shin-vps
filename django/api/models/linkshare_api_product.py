# api/models/linkshare_api_product.py

from django.db import models
from django.utils import timezone

class LinkshareApiProduct(models.Model):
    """
    LinkShare Product Search APIから取得した商品データを、
    JSON全体としてそのまま保存するためのモデル。
    """
    
    # 識別子 (update_or_createのキーとして使用)
    # 💡 linkid の単一ユニーク制約 (unique=True) を削除
    linkid = models.CharField(
        max_length=255, 
        # unique=True は削除し、複合ユニーク制約を Meta クラスで設定
        db_index=True, 
        verbose_name="LinkShare Link ID"
    )
    mid = models.CharField(
        max_length=32, 
        db_index=True, 
        verbose_name="広告主ID (MID)"
    )
    
    # 生JSONデータ (全てのAPIレスポンスデータをここに格納)
    api_response_json = models.JSONField(verbose_name="API生JSONデータ")
    
    # 管理用メタデータ 
    sku = models.CharField(
        max_length=256, 
        db_index=True, 
        verbose_name="SKU/商品コード", 
        default='N/A'
    )
    api_source = models.CharField(
        max_length=50, 
        default='Linkshare-API-Raw', 
        verbose_name="データソース"
    )
    last_updated = models.DateTimeField(
        auto_now=True, 
        verbose_name="最終更新日時"
    )
    
    class Meta:
        db_table = 'linkshare_api_product' 
        verbose_name = 'LinkShare API商品 (生データ)'
        verbose_name_plural = 'LinkShare API商品一覧 (生データ)'
        
        # 💡 【重要修正】linkid と mid の複合ユニーク制約を設定
        constraints = [
            models.UniqueConstraint(
                fields=['linkid', 'mid'], 
                name='unique_linkid_mid' # 新しい制約名
            )
        ]
        
    def __str__(self):
        # JSONから商品名を取得可能であればそれを表示する
        product_name = self.api_response_json.get('productname', '') if isinstance(self.api_response_json, dict) else ''
        return product_name or f"{self.linkid} (MID: {self.mid})"