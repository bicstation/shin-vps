# /home/maya/dev/shin-vps/django/api/utils/adult/fanza_normalizer.py
# -*- coding: utf-8 -*-
import json
import logging
import re
from django.utils.dateparse import parse_date
from django.utils import timezone
from typing import List, Tuple, Dict, Any, Optional

from api.models import RawApiData
from api.utils.common import generate_product_unique_id 

logger = logging.getLogger('api_utils')

def _safe_extract_single_entity(item_info_content: dict, key: str) -> tuple[Optional[str], Optional[str]]:
    """単一エンティティ（メーカー等）の抽出。"""
    data = item_info_content.get(key)
    if not data: return None, None
    if isinstance(data, list):
        if not data: return None, None
        data = data[0]
    if isinstance(data, dict):
        return data.get('name'), data.get('id')
    return (data if isinstance(data, str) else None), None

def _optimize_fanza_url(url: Optional[str]) -> str:
    """FANZA/DMM画像URLを最高画質に置換"""
    if not url: return ""
    if url.startswith('//'): url = 'https:' + url
    if any(d in url for d in ['pics.dmm', 'ebook-assets']):
        url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
        url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
    return url

def _safe_int(value: Any, default: int = 0) -> int:
    if value is None: return default
    clean_val = re.sub(r'[^0-9]', '', str(value))
    if not clean_val: return default
    try: return int(clean_val)
    except: return default

def normalize_fanza_data(raw_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """公式API・読み放題API・詳細スクレイピングJSONを自動判別して正規化"""
    actual_source = getattr(raw_instance, 'api_source', 'FANZA').upper()
    try:
        raw_data = getattr(raw_instance, 'raw_data', None) or getattr(raw_instance, 'data', None)
        if not raw_data: return [], []
        raw_json_data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        
        # 1. スクレイピングデータ (__NEXT_DATA__) 判定
        if 'props' in raw_json_data and 'pageProps' in raw_json_data['props']:
            return _parse_scraping_flow(raw_json_data, actual_source)
            
        # 2. 公式API / 読み放題API (result.items) 判定
        items = raw_json_data.get('result', {}).get('items', [])
        if items:
            return _parse_api_flow(items, raw_json_data, actual_source)
            
    except Exception as e:
        logger.error(f"RawApiData ID {raw_instance.id} 解析エラー: {e}")
    return [], []

def _parse_scraping_flow(json_data: dict, source: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    try:
        queries = json_data.get('props', {}).get('pageProps', {}).get('dehydratedState', {}).get('queries', [])
        c = queries[0].get('state', {}).get('data', {}).get('videoContent', {})
    except (IndexError, KeyError): return [], []
    if not c: return [], []

    cid = c.get('cid')
    img_l = _optimize_fanza_url(c.get('imgSrcLarge'))
    
    product = {
        'api_source': source.lower(),
        'api_product_id': cid,
        'product_id_unique': generate_product_unique_id(source, cid),
        'title': c.get('title'),
        'api_service': 'digital',
        'floor_code': 'videoa', 
        'product_description': c.get('text'), 
        'release_date': parse_date(c.get('releaseDate').replace('/', '-')) if c.get('releaseDate') else None,
        'image_url_list': [img_l] if img_l else [],
        'volume': _safe_int(c.get('runtime')),
        'updated_at': timezone.now(),
        'is_active': True,
    }
    rel = {
        'api_product_id': cid,
        'maker': c.get('makerName'),
        'label': c.get('labelName'),
        'series': c.get('seriesName'),
        'director': c.get('directorName'),
        'genres': [g.get('name') for g in c.get('genres', []) if g.get('name')],
        'people_all': [a.get('name') for a in c.get('actresses', []) if a.get('name')],
    }
    return [product], [rel]

def _parse_api_flow(items: list, raw_json: dict, source: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    p_list, r_list = [], []
    req_params = raw_json.get('request', {}).get('parameters', {})
    is_unlimited_req = (req_params.get('service') == 'unlimited_book')

    for data in items:
        cid = data.get('content_id')
        if not cid: continue
        item_info = data.get('iteminfo', {})
        
        m_name, _ = _safe_extract_single_entity(item_info, 'maker')
        if not m_name: m_name, _ = _safe_extract_single_entity(item_info, 'manufacture')
        
        is_unl = is_unlimited_req or '読み放題' in (data.get('service_name') or '')

        imgs = []
        for k in ['large', 'list', 'small']:
            u = _optimize_fanza_url(data.get('imageURL', {}).get(k))
            if u and u not in imgs: imgs.append(u)
        
        p_list.append({
            'api_source': source.lower(),
            'api_product_id': str(cid),
            'product_id_unique': generate_product_unique_id(source, str(cid)),
            'title': data.get('title'),
            'api_service': data.get('service_code') or req_params.get('service'),
            'floor_code': data.get('floor_code') or req_params.get('floor'),
            'product_description': data.get('description'),
            'release_date': parse_date(data.get('date').split(' ')[0]) if data.get('date') else None,
            'affiliate_url': data.get('affiliateURL') or "",
            'price': _safe_int(data.get('prices', {}).get('price')),
            'is_unlimited': is_unl,
            'volume': _safe_int(data.get('volume')),
            'maker_product_id': data.get('stock_number'),
            'image_url_list': imgs,
            'tachiyomi_url': data.get('URL') if is_unl else None,
            'updated_at': timezone.now(),
            'is_active': True,
        })
        
        # 女優・著者・出演・アーティストをすべて統合
        all_p = item_info.get('actress', []) + item_info.get('author', []) + item_info.get('artist', []) + item_info.get('cast', [])
        p_names = list(dict.fromkeys([p.get('name') for p in all_p if p.get('name')]))

        r_list.append({
            'api_product_id': str(cid),
            'maker': m_name,
            'label': _safe_extract_single_entity(item_info, 'label')[0],
            'series': _safe_extract_single_entity(item_info, 'series')[0],
            'director': _safe_extract_single_entity(item_info, 'director')[0],
            'genres': [g.get('name') for g in item_info.get('genre', []) if g.get('name')],
            'people_all': p_names,
        })
    return p_list, r_list