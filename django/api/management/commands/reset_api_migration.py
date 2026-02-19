# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from api.models import RawApiData

class Command(BaseCommand):
    help = 'RawApiDataのmigratedフラグをリセットします。引数なしで全ソース、--siteで特定サイトを指定可能。'

    def add_arguments(self, parser):
        # 💡 オプションを追加：--site fanza, --site dmm など
        parser.add_argument(
            '--site', 
            type=str, 
            help='リセット対象のサイトを指定 (fanza, dmm, duga)'
        )

    def handle(self, *args, **options):
        site = options.get('site')
        
        self.stdout.write(self.style.NOTICE('--- 移行フラグのリセットを開始します ---'))

        try:
            with transaction.atomic():
                # 1. ベースとなるクエリセットを取得
                qs = RawApiData.objects.all()
                
                # 2. サイト指定があればフィルタリング（大文字小文字を区別しない）
                if site:
                    qs = qs.filter(api_source__iexact=site)
                    source_label = site.upper()
                else:
                    source_label = "全ソース (FANZA/DMM/DUGA)"

                # 更新対象の件数を取得
                total_count = qs.count()
                
                if total_count == 0:
                    self.stdout.write(self.style.WARNING(f'処理対象のRawApiData ({source_label}) が見つかりませんでした。'))
                    return

                # 3. migratedをFalseに、updated_atを現在時刻に一括更新
                updated_count = qs.update(
                    migrated=False,
                    updated_at=timezone.now()
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ {source_label} のRawApiData {updated_count} 件の `migrated` フラグをリセットしました。'
                    )
                )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'リセット処理中にエラーが発生しました: {e}'))
            
        self.stdout.write(self.style.NOTICE('--- リセット処理が完了しました ---'))