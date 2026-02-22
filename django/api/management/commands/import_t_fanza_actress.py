# -*- coding: utf-8 -*-
import os
import time
import requests
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Actress, AdultActressProfile

class Command(BaseCommand):
    help = 'FANZA APIから全女優（約6万件）のスペックをDBに全件保存します'

    def handle(self, *args, **options):
        api_id = os.getenv("FANZA_API_ID", "GkGxcxhcMKUgQGWzPnp9")
        affiliate_id = os.getenv("FANZA_AFFILIATE_ID", "bicbic-990")
        base_url = "https://api.dmm.com/affiliate/v3/ActressSearch"
        
        offset = 1
        hits = 100
        total_count = 1 
        processed_count = 0
        linked_count = 0
        error_count = 0

        self.stdout.write(self.style.SUCCESS(f'🚀 全件同期ミッションを開始します (目標: 約6万件)'))

        while offset <= total_count:
            params = {
                "api_id": api_id,
                "affiliate_id": affiliate_id,
                "hits": hits,
                "offset": offset,
                "sort": "id",
                "output": "json"
            }

            try:
                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()

                result = data.get('result', {})
                total_count = int(result.get('total_count', 0))
                actresses_data = result.get('actress', [])

                if not actresses_data:
                    break

                for act in actresses_data:
                    processed_count += 1
                    act_name = act.get('name')
                    api_val = str(act.get('id'))

                    # 既存DBのマスターを探す
                    master = Actress.objects.filter(name=act_name).first()

                    try:
                        # 全件保存ロジック
                        # actress_id (FANZA ID) をユニークキーとして作成・更新
                        obj, created = AdultActressProfile.objects.update_or_create(
                            actress_id=api_val, 
                            defaults={
                                'master_actress': master, # models側のnull=True化によりNoneでもOK
                                'name': act_name,
                                'ruby': act.get('ruby'),
                                'bust': act.get('bust') if act.get('bust') else None,
                                'cup': act.get('cup'),
                                'waist': act.get('waist') if act.get('waist') else None,
                                'hip': act.get('hip') if act.get('hip') else None,
                                'height': act.get('height') if act.get('height') else None,
                                'birthday': act.get('birthday') if act.get('birthday') and act.get('birthday') != '0000-00-00' else None,
                                'blood_type': act.get('blood_type'),
                                'prefectures': act.get('prefectures'),
                                'hobby': act.get('hobby'),
                                'image_url_small': act.get('imageURL', {}).get('small'),
                                'image_url_large': act.get('imageURL', {}).get('large'),
                                'last_synced_at': timezone.now()
                            }
                        )
                        if master:
                            linked_count += 1

                    except Exception as e:
                        error_count += 1
                        continue
                
                # 進捗を表示：Errorが0付近でProcessedが増えていけば大成功
                self.stdout.write(f"PROGRESS: {processed_count} / {total_count} (Linked: {linked_count}, Errors: {error_count})")
                
                offset += hits
                time.sleep(0.3) # API負荷考慮

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"🚫 通信エラー: {str(e)}"))
                break

        self.stdout.write(self.style.SUCCESS(
            f'✨ ミッション完了! 総格納数: {processed_count - error_count} / {total_count}'
        ))