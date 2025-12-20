from django.db import models
from django.utils.timezone import now

class PCProduct(models.Model):
    """
    PC製品（ノート、デスクトップ等）をサイト・メーカーを問わず管理する汎用モデル
    """
    # 識別用
    unique_id = models.CharField(max_length=255, unique=True, db_index=True, verbose_name="固有ID")
    site_prefix = models.CharField(max_length=20, verbose_name="サイト接頭辞")
    maker = models.CharField(max_length=100, db_index=True, verbose_name="メーカー")
    genre = models.CharField(max_length=50, default='laptop', db_index=True, verbose_name="ジャンル")

    # 基本情報
    name = models.CharField(max_length=500, verbose_name="商品名")
    price = models.IntegerField(verbose_name="価格")
    url = models.URLField(max_length=1000, verbose_name="商品URL")
    image_url = models.URLField(max_length=1000, null=True, blank=True, verbose_name="画像URL")
    description = models.TextField(null=True, blank=True, verbose_name="詳細スペック")

    # 状態管理
    is_active = models.BooleanField(default=True, verbose_name="掲載中")
    created_at = models.DateTimeField(default=now, verbose_name="登録日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    class Meta:
        verbose_name = "PC製品"
        verbose_name_plural = "PC製品一覧"
        ordering = ['price']

    def __str__(self):
        return f"[{self.maker}] {self.name[:30]}"