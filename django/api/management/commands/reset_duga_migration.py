# api/management/commands/reset_duga_migration.py

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import RawApiData

class Command(BaseCommand):
    help = 'DUGA APIのRawApiDataレコードのmigratedフラグをFalseにリセットします。'
    
    # 定数は大文字で定義（表示・比較用）
    API_SOURCE = 'DUGA'
    
    def handle(self, *args, **options):
        """
        指定されたAPIソースのすべてのRawApiDataレコードのmigratedフラグをFalseに設定する。
        """
        self.stdout.write(self.style.NOTICE(f'--- {self.API_SOURCE} 移行フラグのリセットを開始します ---'))

        try:
            with transaction.atomic():
                # 💡 大文字小文字を区別せず 'duga' も 'DUGA' も確実にキャッチ
                qs = RawApiData.objects.filter(api_source__iexact=self.API_SOURCE)
                
                # 更新対象の件数を取得
                total_count = qs.count()
                
                if total_count == 0:
                    # 見つからない場合は、DB内の実際の値を出力してデバッグしやすくする
                    existing_sources = RawApiData.objects.values_list('api_source', flat=True).distinct()
                    self.stdout.write(self.style.WARNING(
                        f'処理対象のRawApiData (APIソース: {self.API_SOURCE}) が見つかりませんでした。\n'
                        f'現在のDB内のソース名候補: {list(existing_sources)}'
                    ))
                    return

                # migratedをFalseに、updated_atを現在時刻に一括更新
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
            # transaction.atomic() により、ここで例外が出れば自動的にロールバックされます
            
        self.stdout.write(self.style.NOTICE('--- リセット処理が完了しました ---'))