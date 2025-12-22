import os
from datetime import datetime

# --- API キーとシークレット (既存のまま) ---
FANZA_API_ID = os.environ.get('FANZA_API_ID', 'DUMMY_FANZA_API_ID') 
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
        'AFFILIATE_ID': FANZA_AFFILIATE_ID, 
        'BASE_URL': 'https://api.dmm.com/affiliate/v3/ItemList',
        'FLOORS': [
            {'service': 'digital', 'floor': 'videoa', 'name': 'AV(動画)'},
            {'service': 'digital', 'floor': 'videoc', 'name': '素人(動画)'},
        ],
        'PARAMS': {
            'site': 'FANZA',
            'hits': 100,
            'sort': 'date',
            'output': 'json',
            'timestamp': datetime.now().strftime('%Y%m%d%H%M%S'),
        }
    },
    'DUGA': {
        'API_ID': DUGA_API_ID,
        'AFFILIATE_ID': DUGA_AFFILIATE_ID,
        'BASE_URL': DUGA_API_URL,
        'TOTAL_LIMIT': DUGA_TOTAL_LIMIT,
    }
}


# --- PC Product ジャンル共通定義 ---
GENRE_DESKTOP = 'desktop'
GENRE_LAPTOP = 'laptop'
GENRE_MONITOR = 'monitor'
GENRE_PERIPHERAL = 'peripheral'
GENRE_OTHER = 'other'

# --- 各サイトの「生カテゴリ(raw_genre)」を「システム共通ジャンル(unified_genre)」に変換するマスターマップ ---
# site_prefix (fr, acerなど) ごとに定義
PC_GENRE_MAP = {
    'fr': {  # Frontier
        'desktop': GENRE_DESKTOP,
        'laptop': GENRE_LAPTOP,
        'monitor': GENRE_MONITOR,
        'peripheral': GENRE_PERIPHERAL,
        'workstation': GENRE_DESKTOP,
        # 日本語が混在する場合の予備
        'デスクトップ': GENRE_DESKTOP,
        'ノートPC': GENRE_LAPTOP,
    },
    'acer': {  # Acer
        'desktop': GENRE_DESKTOP,
        'laptop': GENRE_LAPTOP,
        'notebook': GENRE_LAPTOP, # Acerストア特有の表記
        'monitor': GENRE_MONITOR,
        'peripheral': GENRE_PERIPHERAL,
        'desktops': GENRE_DESKTOP,
    },
    'ms': {  # Mouse Computer (拡張用)
        'デスクトップ': GENRE_DESKTOP,
        'ノートPC': GENRE_LAPTOP,
        'desktop': GENRE_DESKTOP,
        'laptop': GENRE_LAPTOP,
    }
}