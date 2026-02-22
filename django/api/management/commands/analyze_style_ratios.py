# -*- coding: utf-8 -*-
# api/management/commands/analyze_style_ratios.py

from django.core.management.base import BaseCommand
from api.models import AdultActressProfile
from django.db.models import Q

class Command(BaseCommand):
    help = 'B/W/Hデータから黄金比スコアを算出し、ランキングを更新します'

    def handle(self, *args, **options):
        # 数値計算が必要なため、0より大きいデータを持つ対象を抽出
        profiles = AdultActressProfile.objects.filter(
            Q(waist__gt=0) & (Q(bust__gt=0) | Q(hip__gt=0))
        )
        
        self.stdout.write(f"解析対象: {profiles.count()} 名")
        updated_count = 0

        for p in profiles:
            factors = []

            # 1. 黄金比 (W/H比) - 理想は 0.7
            if p.waist and p.hip:
                wh_ratio = float(p.waist) / float(p.hip)
                # 0.7を100点とし、乖離するほど減点
                wh_score = max(0, 100 - abs(wh_ratio - 0.7) * 200)
                factors.append(wh_score * 0.7) # 重み 70%

            # 2. くびれ率 (W/B比) - 理想は 0.618 (黄金比)
            if p.bust and p.waist:
                wb_ratio = float(p.waist) / float(p.bust)
                wb_score = max(0, 100 - abs(wb_ratio - 0.618) * 150)
                factors.append(wb_score * 0.3) # 重み 30%

            if factors:
                final_score = int(sum(factors))
                p.ai_power_score = final_score
                
                # 💡 修正ポイント: 文字列 'GOD' ではなく、
                # モデルの型 (IntegerField) に合わせて数値を代入します。
                # ここでは解析結果をそのままランク数値として保持させます。
                p.score_style = final_score 
                
                p.save()
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"解析完了: {updated_count} 名の数値を更新しました"))