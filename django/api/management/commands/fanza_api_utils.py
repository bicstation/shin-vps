# -*- coding: utf-8 -*-
import os
import requests
from typing import List, Dict, Any

# API設定（環境変数から取得。デフォルトは提供されたもの）
FANZA_API_ID = os.getenv("FANZA_API_ID", "GkGxcxhcMKUgQGWzPnp9")
FANZA_AFFILIATE_ID = os.getenv("FANZA_AFFILIATE_ID", "bicbic-990")
BASE_URL = "https://api.dmm.com/affiliate/v3"

class FanzaAPIClient:
    """FANZA/DMM APIから階層構造と商品リストを取得するユーティリティ"""
    
    def __init__(self, api_id: str = FANZA_API_ID, affiliate_id: str = FANZA_AFFILIATE_ID):
        self.api_id = api_id
        self.affiliate_id = affiliate_id

    def fetch_floor_list(self) -> Dict[str, Any]:
        """FloorList APIから生の階層構造を取得する"""
        endpoint = f"{BASE_URL}/FloorList"
        params = {
            "api_id": self.api_id,
            "affiliate_id": self.affiliate_id,
            "output": "json"
        }
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()

    def get_flattened_floors(self) -> List[Dict[str, str]]:
        """
        APIのネストされた構造を、DB保存に最適なフラットリストに変換する。
        """
        raw_data = self.fetch_floor_list()
        flattened = []
        
        # APIレスポンスの階層を走査
        sites = raw_data.get('result', {}).get('site', [])
        for site in sites:
            # site['code'] は 'DMM.com' または 'FANZA'
            s_code = site['code']
            s_name = site['name']
            
            for service in site.get('service', []):
                svc_code = service['code']
                svc_name = service['name']
                
                for floor in service.get('floor', []):
                    flattened.append({
                        "site_code": s_code,
                        "site_name": s_name,
                        "service_code": svc_code,
                        "service_name": svc_name,
                        "floor_code": floor['code'],
                        "floor_name": floor['name']
                    })
        return flattened

    def fetch_item_list(self, site: str, service: str, floor: str, **kwargs) -> Dict[str, Any]:
        """指定した条件で商品リストを取得（クローラー用）"""
        endpoint = f"{BASE_URL}/ItemList"
        params = {
            "api_id": self.api_id,
            "affiliate_id": self.affiliate_id,
            "site": site,
            "service": service,
            "floor": floor,
            "hits": max(1, min(kwargs.get('hits', 100), 100)),
            "offset": max(1, min(kwargs.get('offset', 1), 50000)),
            "sort": kwargs.get('sort', 'date'),
            "output": "json"
        }
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()