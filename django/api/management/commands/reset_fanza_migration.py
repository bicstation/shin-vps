# api/management/commands/reset_fanza_migration.py

from django.core.management.base import BaseCommand
from django.db.models import F
from django.db import transaction
from django.utils import timezone

from api.models import RawApiData

class Command(BaseCommand):
    help = 'FANZA APIのRawApiDataレコードのmigratedフラグをFalseにリセットします。'
    API_SOURCE = 'FANZA'
    
    def handle(self, *args, **options):
        """
        指定されたAPIソースのすべてのRawApiDataレコードのmigratedフラグをFalseに設定する。
        """
        self.stdout.write(self.style.NOTICE(f'--- {self.API_SOURCE} 移行フラグのリセットを開始します ---'))

        try:
            with transaction.atomic():
                # FANZAソースのレコードのみをフィルタリング
                qs = RawApiData.objects.filter(api_source=self.API_SOURCE)
                
                # 更新対象の件数を取得
                total_count = qs.count()
                
                if total_count == 0:
                    self.stdout.write(self.style.WARNING(f'処理対象のRawApiData (APIソース: {self.API_SOURCE}) が見つかりませんでした。'))
                    return

                # migratedをFalseに、updated_atを現在時刻に更新
                updated_count = qs.update(
                    migrated=False,
                    updated_at=timezone.now()
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ {self.API_SOURCE} ソースのRawApiData {updated_count} 件の `migrated` フラグを False にリセットしました。'
                    )
                )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'リセット処理中にエラーが発生しました: {e}'))
            # エラーが発生した場合、トランザクションはロールバックされます
            
        self.stdout.write(self.style.NOTICE('--- リセット処理が完了しました ---'))