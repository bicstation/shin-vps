# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models import AdultActressProfile

class Command(BaseCommand):
    help = '全女優のBWHデータからAI黄金比スコアを計算します'

    def handle(self, *args, **options):
        # スペックが揃っている女優を抽出
        profiles = AdultActressProfile.objects.filter(
            bust__gt=0, waist__gt=0, hip__gt=0
        )
        
        total = profiles.count()
        self.stdout.write(self.style.SUCCESS(f'📊 解析対象: {total} 名（スペック完備） / 全59,832名中'))

        updated_count = 0
        
        for p in profiles:
            try:
                # 1. 黄金比 (ウエスト / ヒップ) -> 理想は0.7
                wh_ratio = float(p.waist) / float(p.hip)
                wh_score = max(0, 100 - abs(wh_ratio - 0.7) * 400) # 0.7から離れるほど減点

                # 2. 曲線美 (バスト / ウエスト) -> 理想は1.4以上
                bw_ratio = float(p.bust) / float(p.waist)
                bw_score = min(100, bw_ratio * 70) 

                # 3. 総合スコア (AIパワースコア)
                total_score = int((wh_score * 0.6) + (bw_score * 0.4))

                # フィールドへの書き込み
                p.ai_power_score = total_score
                
                # スコアに応じたマトリックス簡易評価
                if total_score >= 90:
                    p.score_style = 100  # Sランク
                elif total_score >= 80:
                    p.score_style = 80   # Aランク
                else:
                    p.score_style = 60   # Bランク

                p.save()
                updated_count += 1
            except Exception:
                continue

        self.stdout.write(self.style.SUCCESS(f'✨ 解析完了! {updated_count}名のスタイルをランク付けしました'))