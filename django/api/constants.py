# api/constants.py

import os
from datetime import datetime

# 📝 .envファイルから読み込むライブラリ（python-dotenv）を使用していると仮定します。
# Docker Compose環境では、これらの変数はコンテナ起動時に自動的に環境変数として設定されます。

# --- API キーとシークレット ---
# 環境変数から取得
FANZA_API_ID = os.environ.get('FANZA_API_ID', 'DUMMY_FANZA_API_ID') 
# FANZAでは SECRET_KEYの代わりに AFFILIATE_ID をアフィリエイトIDとして使用
FANZA_AFFILIATE_ID = os.environ.get('FANZA_AFFILIATE_ID', 'DUMMY_FANZA_AFFILIATE_ID') 

DUGA_API_ID = os.environ.get('DUGA_API_ID', 'DUMMY_DUGA_API_ID')
DUGA_AFFILIATE_ID = os.environ.get('DUGA_AFFILIATE_ID', 'DUMMY_DUGA_AFFILIATE_ID')
DUGA_API_URL = os.environ.get('DUGA_API_URL', 'http://affapi.duga.jp/search')
DUGA_TOTAL_LIMIT = int(os.environ.get('DUGA_TOTAL_LIMIT', 1000))

# --- Product ID のユニーク化ヘルパー ---
def generate_product_unique_id(api_source: str, api_product_id: str) -> str:
    """
    異なるAPIソース間でも一意となる製品IDを生成する。
    """
    return f"{api_source}-{api_product_id}"

# --- API 検索設定 (API_CONFIG) ---
API_CONFIG = {
    'FANZA': {
        'API_ID': FANZA_API_ID,
        # FANZA APIのaffiliate_idパラメータに使用
        'AFFILIATE_ID': FANZA_AFFILIATE_ID, 
        'BASE_URL': 'https://api.dmm.com/affiliate/v3/ItemList',
        'FLOORS': [
            {'service': 'digital', 'floor': 'videoa', 'name': 'AV(動画)'},
            {'service': 'digital', 'floor': 'videoc', 'name': '素人(動画)'},
            # 必要に応じて他のフロアを追加
        ],
        'PARAMS': {
            'site': 'FANZA',
            'hits': 100, # 1ページあたりの取得件数 (最大100)
            'sort': 'date', # リリース日順
            'output': 'json',
            'timestamp': datetime.now().strftime('%Y%m%d%H%M%S'),
        }
    },
    'DUGA': {
        'API_ID': DUGA_API_ID,
        'AFFILIATE_ID': DUGA_AFFILIATE_ID,
        'BASE_URL': DUGA_API_URL,
        'TOTAL_LIMIT': DUGA_TOTAL_LIMIT,
        # DUGAのフロア設定や追加のPARAMSがあればここに追加
    }
}