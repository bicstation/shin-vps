# /mnt/c/dev/SHIN-VPS/django/api/management/commands/test_link_locator.py

import requests
from datetime import datetime
from django.core.management.base import BaseCommand
from .linkshare_bc_client import LinkShareAPIClient

class Command(BaseCommand):
    def handle(self, *args, **options):
        client = LinkShareAPIClient()
        client.refresh_token_if_expired()
        
        token = client.access_token
        mid = "2557" # デル
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Accept': 'application/xml'
        }

        # 💡 エラー解決の鍵：日付形式
        # 仕様書: link-start-date/link-end-date は MMDDYYYY 形式
        # 今日から1年前〜今日まで、など適当な範囲をセットします
        start_date = "01012024" # 2024年1月1日
        end_date = datetime.now().strftime("%m%d%Y") # 今日の日付 (MMDDYYYY)

        base_url = "https://api.linksynergy.com/linklocator/1.0"
        
        # パス構造: getTextLinks/{mid}/{catID}/{startDate}/{endDate}/{campaignID}/{page}
        # 全てのセグメントを正しく埋めます
        text_url = f"{base_url}/getTextLinks/{mid}/-1/{start_date}/{end_date}/-1/1"

        self.stdout.write(self.style.NOTICE(f"🚀 日付形式を修正して再試行"))
        self.stdout.write(f"🌐 リクエストURL: {text_url}")
        
        try:
            res = requests.get(text_url, headers=headers)
            
            self.stdout.write(f"📊 ステータスコード: {res.status_code}")
            
            if res.status_code == 200:
                self.stdout.write(self.style.SUCCESS("✅ ついに成功！デルのリンク情報を取得しました"))
                # XMLの構造が見えるように表示
                print(res.text[:1500]) 
            else:
                self.stdout.write(self.style.ERROR(f"❌ エラー: {res.status_code}"))
                print(res.text)
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 通信エラー: {e}"))