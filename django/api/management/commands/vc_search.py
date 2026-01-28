# -*- coding: utf-8 -*-
import requests
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'バリューコマースAPI 疎通テスト（固定トークン使用）'

    SHOP_LIST = {
        "1": {"name": "レノボ・ショッピング", "ec_code": "bdu8t"},
        "2": {"name": "マウスコンピューター", "ec_code": "bdust"},
        "3": {"name": "NEC Direct", "ec_code": "j8pq5"},
        "4": {"name": "パソコン工房", "ec_code": "02v30"},
        "5": {"name": "ドスパラ", "ec_code": "02v30"},
        "6": {"name": "ノジマオンライン", "ec_code": "hrjyq"},
        "7": {"name": "サンワダイレクト", "ec_code": "j22up"},
        "8": {"name": "タンタンショップ", "ec_code": "hr7r6"},
        "9": {"name": "Yahoo!ショッピング", "ec_code": "0hzmc"},
        "10": {"name": "富士通 WEB MART", "ec_code": "j22p2"},
    }

    def add_arguments(self, parser):
        parser.add_argument('keyword', type=str, help='検索キーワード')
        parser.add_argument('--shop', type=str, default="9", help='ショップ番号 (デフォルト9:Yahoo)')

    def handle(self, *args, **options):
        # 🔑 ご提示いただいた固定トークンを直接セット
        ACCESS_TOKEN = "1-30e485321b27a0d627c97b6b5c768d64"

        search_url = "http://webservice.valuecommerce.ne.jp/productdb/search"
        shop_info = self.SHOP_LIST.get(options['shop'], self.SHOP_LIST["9"])
        
        params = {
            "token": ACCESS_TOKEN,
            "keyword": options['keyword'],
            "format": "json",
            "ecCode": shop_info['ec_code'],
            "results_per_page": 5, # テスト用に5件
        }

        self.stdout.write(self.style.NOTICE(f"🚀 固定トークンで検索実行: [{shop_info['name']}]"))

        try:
            # 💡 ヘッダーなし、クエリパラメータのみでリクエスト
            res = requests.get(search_url, params=params, timeout=15)
            data = res.json()
            
            if data.get("status") != "OK":
                self.stderr.write(f"❌ APIエラー: {data.get('status')}")
                return

            items = data.get("items", [])
            if not items:
                self.stdout.write(self.style.WARNING("⚠️ 認証は成功しましたが、商品が1件も見つかりませんでした。"))
                return

            self.stdout.write("=" * 60)
            for i, item in enumerate(items, 1):
                title = item.get('title', 'No Title')
                price = item.get('price', 0)
                self.stdout.write(f"{i:2d}: {title[:50]}...")
                self.stdout.write(f"    💰 ¥{int(price):,}")
            self.stdout.write("=" * 60)
            self.stdout.write(self.style.SUCCESS(f"✅ 成功! {len(items)} 件のデータを取得しました。"))

        except Exception as e:
            self.stderr.write(f"❌ 通信エラー: {e}")