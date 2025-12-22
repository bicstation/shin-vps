from django.db import models
from django.utils.timezone import now

class PCProduct(models.Model):
    """
    PC製品を管理する汎用モデル（2重仕分け対応版）
    """
    # 識別用
    unique_id = models.CharField(max_length=255, unique=True, db_index=True, verbose_name="固有ID")
    site_prefix = models.CharField(max_length=20, verbose_name="サイト接頭辞")
    maker = models.CharField(max_length=100, db_index=True, verbose_name="メーカー")
    
    # 💡 2重仕分け用カラム
    # 既存データへの対応として default="" を追加
    raw_genre = models.CharField(
        max_length=100, 
        default="", 
        verbose_name="サイト別分類"
    )
    unified_genre = models.CharField(
        max_length=50, 
        default="", 
        db_index=True, 
        verbose_name="統合ジャンル"
    )

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

    # 💡 保存時に「逆ロジック」を自動実行する仕組み
    def save(self, *args, **kwargs):
        # もし統合ジャンルが空で、生分類が入っている場合、生分類を統合ジャンルにコピーする
        # (スクレイパー側で入れ忘れた際のフォールバック)
        if not self.unified_genre and self.raw_genre:
            self.unified_genre = self.raw_genre
        
        super().save(*args, **kwargs)