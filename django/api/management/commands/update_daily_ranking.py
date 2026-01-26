# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models.pc_stats import ProductDailyStats
from django.utils import timezone
from django.db.models import Window, F
from django.db.models.functions import Rank

class Command(BaseCommand):
    help = '昨日のPV数に基づいて製品の注目度ランキングを計算します'

    def handle(self, *args, **options):
        # 昨日の日付を取得
        target_date = timezone.now().date() # 実行時点の「今日」のランキングを作る場合
        
        # 指定日の統計データを取得
        stats_list = ProductDailyStats.objects.filter(date=target_date).order_by('-pv_count')

        if not stats_list.exists():
            self.stdout.write(self.style.WARNING(f"⚠️ {target_date} の統計データが見つかりません。"))
            return

        # PVが多い順に順位を割り当てて更新
        for i, stats in enumerate(stats_list, start=1):
            stats.daily_rank = i
            # ランキングスコアも必要なら計算（例：1位を100点、以下減点など）
            stats.ranking_score = max(0, 100 - (i - 1)) 
            stats.save()

        self.stdout.write(self.style.SUCCESS(
            f"✅ {target_date} のランキング（{stats_list.count()}件）を更新しました！"
        ))