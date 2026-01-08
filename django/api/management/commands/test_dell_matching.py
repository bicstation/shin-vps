# /mnt/c/dev/SHIN-VPS/django/api/management/commands/test_link_locator.py

import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from django.core.management.base import BaseCommand
from .linkshare_bc_client import LinkShareAPIClient

class Command(BaseCommand):
    help = 'APIリンクとスクレイピング製品のマッチングシミュレーション'

    def handle(self, *args, **options):
        client = LinkShareAPIClient()
        client.refresh_token_if_expired()
        
        token = client.access_token
        mid = "2557"
        
        # 1. APIからリンクをロード（1ページ目だけでテスト）
        self.stdout.write(self.style.NOTICE("📡 APIからリンクをロード中..."))
        start_date = "01012024"
        end_date = datetime.now().strftime("%m%d%Y")
        url = f"https://api.linksynergy.com/linklocator/1.0/getTextLinks/{mid}/-1/{start_date}/{end_date}/-1/1"
        
        res = requests.get(url, headers={'Authorization': f'Bearer {token}', 'Accept': 'application/xml'})
        
        all_api_links = []
        if res.status_code == 200:
            root = ET.fromstring(res.text)
            ns = {'ns1': 'http://endpoint.linkservice.linkshare.com/'}
            for item in root.findall('.//ns1:return', ns):
                all_api_links.append({
                    'name': item.findtext('ns1:linkName', namespaces=ns),
                    'click_url': item.findtext('ns1:clickURL', namespaces=ns)
                })
        
        self.stdout.write(self.style.SUCCESS(f"✅ {len(all_api_links)}件のリンクをメモリに展開しました。"))

        # 2. スクレイピングで見つけたと仮定する製品リスト
        # 実際の運用ではDBから引っ張ってくるリストになります
        scraped_products = [
            "Alienware m18", 
            "Inspiron 3030",
            "XPS 13",
            "非実在パソコン123" 
        ]

        # 汎用フォールバック用リンク（リストの最初の方にある汎用的なもの）
        fallback_link = all_api_links[0] if all_api_links else None

        self.stdout.write(self.style.NOTICE("\n--- 自動紐付けシミュレーション ---"))

        for product_name in scraped_products:
            self.stdout.write(f"\n🔍 スクレイピング製品: {product_name}")
            
            # 部分一致で検索
            match = next((l for l in all_api_links if product_name.lower() in l['name'].lower()), None)
            
            if match:
                self.stdout.write(self.style.SUCCESS(f"  🎯 紐付け成功: {match['name']}"))
                self.stdout.write(f"  🔗 最終URL: {match['click_url']}")
            else:
                self.stdout.write(self.style.WARNING(f"  ⚠️ 該当なし。汎用リンクを使用します。"))
                self.stdout.write(f"  🔗 最終URL: {fallback_link['click_url'] if fallback_link else 'N/A'}")