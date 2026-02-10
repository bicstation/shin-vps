# -*- coding: utf-8 -*-
import json
import logging
import re
from datetime import datetime
from django.utils.dateparse import parse_date
from django.utils import timezone
from typing import List, Tuple, Dict, Any, Optional

# 必要なモデルとユーティリティ
from api.models import RawApiData
from api.utils.common import generate_product_unique_id 

# ロガー設定
logger = logging.getLogger('api_utils')

def _safe_extract_single_entity(item_info_content: dict, key: str) -> tuple[Optional[str], Optional[str]]:
    """
    FANZA/DMMのデータ構造に合わせて、単一のエンティティ（メーカー、レーベル等）を抽出
    """
    data = item_info_content.get(key)
    if not data:
        return None, None
    
    if isinstance(data, list):
        if not data:
            return None, None
        data = data[0]
    
    if isinstance(data, dict):
        return data.get('name'), data.get('id')
    elif isinstance(data, str):
        return data, None
    return None, None

def _optimize_fanza_url(url: Optional[str]) -> str:
    """
    DMM/FANZAの画像URLを正規表現で最高画質(Large)に変換
    """
    if not url:
        return ""
    
    # プロトコル補完
    if url.startswith('//'):
        url = 'https:' + url

    # DMMサーバーの画像であれば置換ロジックを適用
    if 'pics.dmm.com' in url or 'pics.dmm.co.jp' in url:
        # パターンA: ps.jpg / pt.jpg (Small/Thumb) -> pl.jpg (Large)
        url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
        # パターンB: _s.jpg / _m.jpg (Small/Medium) -> _l.jpg (Large)
        url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        
    return url

def normalize_fanza_data(raw_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    RawApiData のレコードを正規化。動画データもJSON形式で集約します。
    """
    products_data_list = []
    relations_list = []
    
    actual_source = getattr(raw_instance, 'api_source', 'FANZA')
    
    try:
        raw_data = getattr(raw_instance, 'raw_json_data', None)
        if raw_data is None:
            return [], []

        if isinstance(raw_data, dict):
            raw_json_data = raw_data
        elif isinstance(raw_data, str):
            raw_json_data = json.loads(raw_data)
        else:
            return [], []
            
        items = raw_json_data.get('result', {}).get('items', [])
    except Exception as e:
        logger.error(f"RawApiData ID {raw_instance.id} のデコードエラー: '{e}'")
        return [], []

    if not items:
        return [], []

    for data in items:
        api_product_id = data.get('content_id')
        title = data.get('title')
        
        if not api_product_id or not title:
            continue

        item_info = data.get('iteminfo', {})
        
        # 1. エンティティ抽出
        maker_name, _ = _safe_extract_single_entity(item_info, 'maker')
        label_name, _ = _safe_extract_single_entity(item_info, 'label')
        series_name, _ = _safe_extract_single_entity(item_info, 'series')
        director_name, _ = _safe_extract_single_entity(item_info, 'director')
        
        # 2. ジャンル・女優
        genre_names = [g.get('name') for g in item_info.get('genre', []) if g.get('name')]
        actress_names = [a.get('name') for a in item_info.get('actress', []) if a.get('name')]
        
        # 3. 画像URLリスト（高画質化）
        image_url_list = []
        image_data = data.get('imageURL', {})
        sample_image_dict = data.get('sampleImageURL', {})

        for key in ['large', 'list', 'small']:
            u = _optimize_fanza_url(image_data.get(key))
            if u and u not in image_url_list:
                image_url_list.append(u)

        sample_l_images = sample_image_dict.get('sample_l', {}).get('image', [])
        if isinstance(sample_l_images, list):
            for img in sample_l_images:
                u = _optimize_fanza_url(img)
                if u and u not in image_url_list:
                    image_url_list.append(u)

        # 4. サンプル動画データ (JSON形式)
        movie_urls = data.get('sampleMovieURL', {})
        movie_json_data = {}
        
        sample_movie_path = (
            movie_urls.get('size_720_480') or 
            movie_urls.get('size_644_414') or 
            movie_urls.get('size_560_360') or ""
        )
        
        if sample_movie_path:
            if sample_movie_path.startswith('//'):
                sample_movie_path = 'https:' + sample_movie_path
            
            preview_images = movie_urls.get('pc_flag_images', {}).get('image', [])
            raw_preview = preview_images[0] if isinstance(preview_images, list) and preview_images else ""
            
            movie_json_data = {
                'url': sample_movie_path,
                'preview_image': _optimize_fanza_url(raw_preview)
            }

        # 5. 価格
        price_val = None
        price_raw = data.get('prices', {}).get('price')
        if price_raw:
            try:
                price_clean = str(price_raw).replace('~', '').replace(',', '').strip()
                if price_clean.isdigit():
                    price_val = int(price_clean)
            except:
                price_val = None
        
        # 6. 集約
        product_id_unique = generate_product_unique_id(actual_source, str(api_product_id))
        
        product_data = {
            'api_source': actual_source,
            'api_product_id': str(api_product_id),
            'product_id_unique': product_id_unique,
            'title': title,
            'release_date': parse_date(data.get('date').split(' ')[0]) if data.get('date') else None,
            'affiliate_url': data.get('affiliateURL') or "", 
            'price': price_val,
            'image_url_list': image_url_list,
            'sample_movie_url': movie_json_data if movie_json_data else None,
            'maker': maker_name,
            'label': label_name,
            'series': series_name,
            'director': director_name,
            'updated_at': timezone.now(),
            'is_active': True,
            'is_posted': False,
        }
        
        products_data_list.append(product_data)
        relations_list.append({
            'api_product_id': str(api_product_id),
            'genres': genre_names,
            'actresses': actress_names,
        })

    return products_data_list, relations_list