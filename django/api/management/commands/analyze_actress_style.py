# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models import AdultActressProfile
from django.db.models import Q

class Command(BaseCommand):
    help = '全女優のBWHデータからAI黄金比スコアを計算します'

    def handle(self, *args, **options):
        # 明示的に「B,W,Hのいずれかが0より大きい」人を全員取得
        # 文字列として入っている可能性も考慮し、フィルタをシンプルに
        profiles = AdultActressProfile.objects.exclude(
            Q(bust=0) | Q(waist=0) | Q(hip=0) |
            Q(bust__isnull=True) | Q(waist__isnull=True) | Q(hip__isnull=True)
        )
        
        total = profiles.count()
        # 全件数も取得して比較用に表示
        all_count = AdultActressProfile.objects.count()
        
        self.stdout.write(self.style.SUCCESS(f'📊 解析対象: {total} 名 / DB全件: {all_count} 名'))

        if total == 0:
            self.stdout.write(self.style.WARNING('⚠️ 解析可能なデータが見つかりませんでした。'))
            return

        updated_count = 0
        
        for i, p in enumerate(profiles):
            try:
                # 0除算防止ガード
                if not (p.bust and p.waist and p.hip):
                    continue

                # 数値変換 (Decimalや文字列対策)
                b = float(p.bust)
                w = float(p.waist)
                h = float(p.hip)

                # 1. 黄金比 (ウエスト / ヒップ) -> 理想は0.7
                wh_ratio = w / h
                wh_score = max(0, 100 - abs(wh_ratio - 0.7) * 400)

                # 2. 曲線美 (バスト / ウエスト) -> 理想は1.4以上
                bw_ratio = b / w
                bw_score = min(100, bw_ratio * 70) 

                # 3. 総合スコア
                total_score = int((wh_score * 0.6) + (bw_score * 0.4))

                p.ai_power_score = total_score
                
                # スコアに応じたランク付け
                if total_score >= 90:
                    p.score_style = 100
                elif total_score >= 80:
                    p.score_style = 80
                else:
                    p.score_style = 60

                p.save()
                updated_count += 1

                if updated_count % 1000 == 0:
                    self.stdout.write(f'🚀 {updated_count}名 完了...')

            except (ValueError, ZeroDivisionError, TypeError):
                continue
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'❌ エラー: {p.name} - {str(e)}'))
                continue

        self.stdout.write(self.style.SUCCESS(f'✨ 解析完了! {updated_count}名のスタイルをランク付けしました'))