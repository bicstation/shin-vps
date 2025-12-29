import hashlib
from api.constants import PC_GENRE_MAP, GENRE_OTHER

def get_unified_genre(site_prefix, raw_category):
    """
    生のカテゴリ名を共通ジャンルに変換する
    """
    mapping = PC_GENRE_MAP.get(site_prefix, {})
    return mapping.get(raw_category.lower(), GENRE_OTHER)

def generate_pc_unique_id(url):
    """
    URLから一意のハッシュIDを生成
    """
    return hashlib.md5(url.encode()).hexdigest()