import base64
import requests
import json
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'バリューコマースAPIを使用してLenovo製品を確実に取得するテスト'

    def handle(self, *args, **options):
        # 1. 認証情報の準備
        CLIENT_KEY = "85a47e6b327f77819d9123a05fda0ed2242ac711"
        CLIENT_SECRET = "b6f4b9b58b6ce8a5836ef98ca772bdf51e32a2e8"
        
        # 署名作成
        raw_sig = f"{CLIENT_KEY}|{CLIENT_SECRET}"
        signature = base64.b64encode(raw_sig.encode()).decode()

        self.stdout.write(self.style.SUCCESS("--- 認証プロセス開始 ---"))

        # 2. アクセストークンの取得
        token_url = "https://api.valuecommerce.com/auth/v1/affiliate/token/?grant_type=client_credentials"
        token_headers = {
            "Authorization": f"Bearer {signature}",
            "Accept": "application/json"
        }
        
        try:
            token_res = requests.get(token_url, headers=token_headers)
            token_res.raise_for_status()
            token = token_res.json().get("access_token")
        except Exception as e:
            self.stderr.write(f"トークン取得失敗: {str(e)}")
            return

        # 3. 商品検索ロジック (ヒット率を最大化する構成)
        search_url = "http://webservice.valuecommerce.ne.jp/productdb/search"
        
        # テストする検索パターン（優先度の高い順）
        search_patterns = [
            {"keyword": "lenovo", "pcmobile": "パソコン~~ノートパソコン"},
            {"keyword": "thinkPad", "category": ""}, # カテゴリを指定せず広く拾う
            {"keyword": "レノボ", "category": ""},   # カタカナ表記
        ]

        found_any = False
        for pattern in search_patterns:
            self.stdout.write(f"検索中... [キーワード: {pattern['keyword']}, カテゴリ: {pattern['category']}]")
            
            params = {
                "token": token,
                "keyword": pattern['keyword'],
                "category": pattern['category'],
                "format": "json",
                "result_count": 10,
                "sort_by": "price_desc",
            }

            try:
                search_res = requests.get(search_url, params=params)
                data = search_res.json()
                items = data.get("items", [])

                if items:
                    found_any = True
                    self.stdout.write(self.style.SUCCESS(f"-> {len(items)}件ヒットしました！"))
                    for i, item in enumerate(items, 1):
                        name = item.get("productname")
                        price = item.get("price", {}).get("value")
                        merchant = item.get("merchantname")
                        self.stdout.write(f"   {i}: [{merchant}] {name[:50]}... ({price}円)")
                    # ヒットしたらループを抜ける（または継続して全パターン試す）
                else:
                    self.stdout.write(self.style.WARNING("   商品は見つかりませんでした。"))
            except Exception as e:
                self.stderr.write(f"検索エラー: {str(e)}")

        if not found_any:
            self.stdout.write(self.style.ERROR("\n最終結果: すべてのパターンで商品が見つかりませんでした。"))
            self.stdout.write("【確認事項】バリューコマース管理画面で『レノボ・ショッピング』等の広告主と『提携完了』しているかご確認ください。")