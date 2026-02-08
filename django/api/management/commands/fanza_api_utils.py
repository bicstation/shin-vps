# -*- coding: utf-8 -*-
import os
import requests
import json
from typing import List, Dict, Any

# --- 環境変数または設定からAPI情報を取得 ---
FANZA_API_ID = os.getenv("FANZA_API_ID", "GkGxcxhcMKUgQGWzPnp9")
FANZA_AFFILIATE_ID = os.getenv("FANZA_AFFILIATE_ID", "bicbic-990")

BASE_URL = "https://api.dmm.com/affiliate/v3"

class FanzaAPIClient:
    """FANZA/DMM APIと通信するためのユーティリティクラス"""
    
    def __init__(self, api_id: str = FANZA_API_ID, affiliate_id: str = FANZA_AFFILIATE_ID):
        self.api_id = api_id
        self.affiliate_id = affiliate_id

    def fetch_floor_list(self) -> Dict[str, Any]:
        """
        DMM/FANZAの全サービス・フロア構造を取得する。
        """
        endpoint = f"{BASE_URL}/FloorList"
        params = {
            "api_id": self.api_id,
            "affiliate_id": self.affiliate_id,
            "output": "json"
        }
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()

    def fetch_item_list(self, site: str, service: str, floor: str, hits: int = 100, offset: int = 1, sort: str = "date") -> Dict[str, Any]:
        """
        指定したフロアの商品リストを取得する。
        
        Args:
            site (str): 'DMM.com' または 'FANZA'
            service (str): サービスコード (例: 'digital')
            floor (str): フロアコード (例: 'videoa')
            hits (int): 取得件数 (最大100)
            offset (int): 検索開始位置 (1〜50000)
            sort (str): 並び順 (date, rank, review, price, -price)
        """
        endpoint = f"{BASE_URL}/ItemList"
        
        # 数値のバリデーション（APIエラーを未然に防ぐ）
        hits = max(1, min(hits, 100))
        offset = max(1, min(offset, 50000))

        params = {
            "api_id": self.api_id,
            "affiliate_id": self.affiliate_id,
            "site": site,
            "service": service,
            "floor": floor,
            "hits": hits,
            "offset": offset,
            "sort": sort,
            "output": "json"
        }
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()

    def get_dynamic_menu(self) -> List[Dict[str, str]]:
        """
        FloorList APIの結果を解析して、巡回しやすい平坦なリストに変換する。
        """
        raw_data = self.fetch_floor_list()
        menu = []
        
        sites = raw_data.get('result', {}).get('site', [])
        for site in sites:
            for service in site.get('service', []):
                for floor in service.get('floor', []):
                    menu.append({
                        "label": f"{site['name']} > {service['name']} > {floor['name']}",
                        "site": site['code'],           # 'DMM.com' または 'FANZA'
                        "site_name": site['name'],       # 表示・ディレクトリ用
                        "service": service['code'],     # 'digital' 等
                        "service_name": service['name'], # 'ビデオ' 等
                        "floor": floor['code'],         # 'videoa' 等
                        "floor_name": floor['name']      # 'ビデオ' 等
                    })
        return menu

# --- 動作確認用 ---
if __name__ == "__main__":
    client = FanzaAPIClient()
    try:
        menu = client.get_dynamic_menu()
        print(f"取得したフロア総数: {len(menu)}")
        if menu:
            # 1ページ目、1件だけ取得テスト
            test = client.fetch_item_list(
                site=menu[0]['site'], 
                service=menu[0]['service'], 
                floor=menu[0]['floor'], 
                hits=1
            )
            print("✅ API接続テスト成功")
    except Exception as e:
        print(f"❌ Error: {e}")