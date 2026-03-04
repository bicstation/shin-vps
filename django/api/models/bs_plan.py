from django.db import models
from .bs_carrier import BSCarrier

class BSMobilePlan(models.Model):
    carrier = models.ForeignKey(BSCarrier, on_delete=models.CASCADE, related_name='plans')
    name = models.CharField("プラン名", max_length=100)
    base_fee = models.IntegerField("基本月額(税込)")
    data_gb = models.IntegerField("データ容量(GB)")
    
    # 割引ロジック用
    family_discount_step1 = models.IntegerField("家族割(2回線)", default=0)
    family_discount_step2 = models.IntegerField("家族割(3回線以上)", default=0)
    fixed_line_discount = models.IntegerField("光回線セット割", default=0)
    card_discount = models.IntegerField("カード払い割引", default=0)
    
    wp_article_id = models.IntegerField("解説記事ID(WP)", null=True, blank=True)

    class Meta:
        verbose_name = "BS通信プラン"
        verbose_name_plural = "BS通信プラン一覧"