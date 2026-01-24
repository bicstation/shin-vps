# /home/maya/dev/shin-vps/django/api/models/pc_stats.py
from django.db import models
from api.models.pc_products import PCProduct

class ProductDailyStats(models.Model):
    """製品の日次統計データ（ランキング推移用）"""
    product = models.ForeignKey(
        PCProduct, 
        on_delete=models.CASCADE, 
        related_name='daily_stats'
    )
    date = models.DateField(db_index=True) # 記録日
    pv_count = models.PositiveIntegerField(default=0) # その日の閲覧数
    ranking_score = models.FloatField(default=0.0)    # 独自の注目度スコア
    daily_rank = models.PositiveIntegerField(null=True, blank=True) # その日の順位

    class Meta:
        unique_together = ('product', 'date') # 1製品につき1日1レコード
        ordering = ['-date']

    def __str__(self):
        return f"{self.date} - {self.product.name}"