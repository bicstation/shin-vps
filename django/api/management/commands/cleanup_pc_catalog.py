# api/management/commands/cleanup_pc_catalog.py
# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = '在庫切れ商品の整理と古いデータの非表示化を行い、カタログの鮮度を維持します'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # 🟢 1. 生存確認（在庫切れの自動判定）
        # 最終更新（updated_at）から 7日 以上経過した商品は、
        # スクレイピングやAPIから消えた（＝販売終了）とみなして在庫切れにする。
        limit_date = now - timedelta(days=7)
        expired_count = PCProduct.objects.filter(
            updated_at__lt=limit_date,
            stock_status="在庫あり"
        ).update(stock_status="在庫切れ")

        # 🔴 2. 徹底清掃（ノイズの非表示化）
        # 在庫切れであり、かつAI解析もされていないような古い不完全データは、
        # ユーザーに見せる価値がないため非表示（is_active=False）にする。
        cleanup_date = now - timedelta(days=30)
        hidden_count = PCProduct.objects.filter(
            stock_status="在庫切れ",
            last_spec_parsed_at__isnull=True,
            updated_at__lt=cleanup_date
        ).update(is_active=False)

        # 🔵 3. 最新商品のブースト
        # 逆に、新しく入ってきた解析済み商品は確実にアクティブにする
        activated_count = PCProduct.objects.filter(
            stock_status="在庫あり",
            last_spec_parsed_at__isnull=False,
            is_active=False
        ).update(is_active=True)

        self.stdout.write(self.style.SUCCESS(
            f"🧹 クリーンアップ完了:\n"
            f"   - 在庫切れに変更: {expired_count}件\n"
            f"   - 低品質データを非表示: {hidden_count}件\n"
            f"   - 優良データを再有効化: {activated_count}件"
        ))