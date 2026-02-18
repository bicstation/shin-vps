# -*- coding: utf-8 -*-
import os
import logging
import requests
from typing import List, Dict, Any

# ログ設定
logger = logging.getLogger(__name__)

# API設定（環境変数から取得）
FANZA_API_ID = os.getenv("FANZA_API_ID", "GkGxcxhcMKUgQGWzPnp9")
FANZA_AFFILIATE_ID = os.getenv("FANZA_AFFILIATE_ID", "bicbic-990")
BASE_URL = "https://api.dmm.com/affiliate/v3"

class FanzaAPIClient:
    """
    FANZA/DMM APIから階層構造と商品リストを取得するユーティリティ。
    APIの仕様（siteパラメータの厳密な区別）に準拠。
    """
    
    def __init__(self, api_id: str = FANZA_API_ID, affiliate_id: str = FANZA_AFFILIATE_ID):
        self.api_id = api_id
        self.affiliate_id = affiliate_id

    def get_dynamic_menu(self) -> List[Dict[str, str]]:
        """
        実行スクリプトが呼び出すエントリーポイント。
        内部で平坦化したフロアリストを返します。
        """
        return self.get_flattened_floors()

    def fetch_floor_list(self) -> Dict[str, Any]:
        """FloorList APIから生の階層構造を取得する"""
        endpoint = f"{BASE_URL}/FloorList"
        params = {
            "api_id": self.api_id,
            "affiliate_id": self.affiliate_id,
            "output": "json"
        }
        try:
            response = requests.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"FloorList取得失敗: {e}")
            raise

    def get_flattened_floors(self) -> List[Dict[str, str]]:
        """
        APIのネストされた構造を、DB保存およびリクエストに最適なフラットリストに変換。
        🔑 修正の要: site, service, floor のキーをAPI期待値(大文字等)で保持。
        """
        raw_data = self.fetch_floor_list()
        flattened = []
        
        sites = raw_data.get('result', {}).get('site', [])
        for site in sites:
            # 重要: ここは 'FANZA' または 'DMM.com' という文字列がそのまま入ります
            raw_site_code = site.get('code') 
            site_name = site.get('name')
            
            for service in site.get('service', []):
                raw_service_code = service.get('code')
                service_name = service.get('name')
                
                for floor in service.get('floor', []):
                    raw_floor_code = floor.get('code')
                    floor_name = floor.get('name')
                    
                    # 🚀 すべての期待されるキーをセット
                    flattened.append({
                        # APIリクエスト用（絶対修正禁止）
                        "site": raw_site_code,        # 'FANZA' or 'DMM.com'
                        "service": raw_service_code,  # 'digital', 'mono' 等
                        "floor": raw_floor_code,      # 'videoa' 等
                        
                        # 管理・表示用
                        "site_code": raw_site_code,
                        "site_name": site_name,
                        "service_code": raw_service_code,
                        "service_name": service_name,
                        "floor_code": raw_floor_code,
                        "floor_name": floor_name,
                    })
        
        logger.info(f"合計 {len(flattened)} 個のフロアを巡回リストに登録しました。")
        return flattened

    def fetch_item_list(self, site: str, service: str, floor: str, **kwargs) -> Dict[str, Any]:
        """
        指定した条件で商品リストを取得。
        siteには 'FANZA' または 'DMM.com' が必須。
        """
        if not site or not floor:
            logger.warning(f"パラメータ不正: site={site}, floor={floor}")
            return {"result": {"status": "400", "message": "Missing parameters"}}

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
        
        try:
            # 📡 ここで実際のリクエストを送信
            response = requests.get(endpoint, params=params, timeout=15)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"ItemList取得エラー [{site}][{floor}]: {e}")
            raise