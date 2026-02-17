# -*- coding: utf-8 -*-
# api/management/commands/sync_fanza_floors.py

from django.core.management.base import BaseCommand
from api.management.commands.fanza_api_utils import FanzaAPIClient
from api.models import FanzaFloorMaster  # __init__.pyの定義に従いインポート

class Command(BaseCommand):
    help = 'FANZA/DMMの階層構造をAPIから取得して階層マスタ(FanzaFloorMaster)に保存します'

    def handle(self, *args, **options):
        self.stdout.write("--- FANZA階層データ同期開始 ---")
        client = FanzaAPIClient()
        self.stdout.write("APIから最新の階層構造(FloorList)を取得中...")
        
        try:
            # APIからフラット化されたリストを取得
            floors = client.get_flattened_floors()
            
            if not floors:
                self.stdout.write(self.style.WARNING("APIからデータが取得できませんでした。"))
                return

            count_created = 0
            count_updated = 0

            for item in floors:
                # FanzaFloorMasterのフィールド定義に合わせて保存
                # floor_code はマスタ内で一意(unique)である前提でキーとして使用
                obj, created = FanzaFloorMaster.objects.update_or_create(
                    floor_code=item['floor_code'],
                    defaults={
                        'site_code': item['site_code'],
                        'site_name': item['site_name'],
                        'service_code': item['service_code'],
                        'service_name': item['service_name'],
                        'floor_name': item['floor_name'],
                    }
                )
                
                if created:
                    count_created += 1
                else:
                    count_updated += 1

            self.stdout.write(self.style.SUCCESS(
                f"同期完了: 合計 {len(floors)} 件を処理しました。\n"
                f"  - 新規追加: {count_created} 件\n"
                f"  - 既存更新: {count_updated} 件"
            ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"実行中に致命的なエラーが発生しました: {str(e)}"))
            # トラブルシューティングが必要な場合は以下の2行を有効化してください
            # import traceback
            # self.stdout.write(self.style.ERROR(traceback.format_exc()))