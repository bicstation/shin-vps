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
        # p[s|t].jpg -> pl.jpg / _[ms].jpg -> _l.jpg
        url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
        url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
    return url

def _safe_int(value: Any, default: int = 0) -> int:
    """数値抽出の安全な処理"""
    if value is None: return default
    clean_val = re.sub(r'[^0-9]', '', str(value))
    if not clean_val: return default
    try: return int(clean_val)
    except: return default

def normalize_fanza_data(raw_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """公式API・読み放題API・詳細スクレイピングJSONを自動判別して正規化"""
    actual_source = getattr(raw_instance, 'api_source', 'FANZA').upper()
    try:
        # モデルのフィールド名 'raw_json_data' を使用
        raw_data = getattr(raw_instance, 'raw_json_data', None)
        if not raw_data: return [], []
        
        # 文字列ならデコード、辞書ならそのまま使用
        raw_json_data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        
        # 1. スクレイピングデータ (__NEXT_DATA__) 判定
        if 'props' in raw_json_data and 'pageProps' in raw_json_data['props']:
            return _parse_scraping_flow(raw_json_data, actual_source)
            
        # 2. 公式API / 読み放題API (result.items) 判定
        if 'result' in raw_json_data and 'items' in raw_json_data['result']:
            items = raw_json_data['result']['items']
            return _parse_api_flow(items, raw_json_data, actual_source)
            
    except Exception as e:
        logger.error(f"RawApiData ID {raw_instance.id} 解析エラー: {e}")
    return [], []

def _parse_scraping_flow(json_data: dict, source: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """__NEXT_DATA__ 形式のスクレイピングデータを解析"""
    try:
        page_props = json_data.get('props', {}).get('pageProps', {})
        queries = page_props.get('dehydratedState', {}).get('queries', [])
        
        # videoContentを含むデータをクエリリストから検索
        c = next((q['state']['data']['videoContent'] for q in queries 
                  if isinstance(q.get('state', {}).get('data'), dict) and 'videoContent' in q['state']['data']), None)
        
        affiliate_id = page_props.get('affiliateId', 'default-990')
    except (IndexError, KeyError, TypeError):
        return [], []

    if not c:
        return [], []

    cid = c.get('id') or c.get('contentId')
    img_l = _optimize_fanza_url(c.get('imgSrcLarge'))
    
    # サンプル動画情報は生の辞書形式で保持
    movie_info = {
        "content_id": cid,
        "affiliate_id": affiliate_id,
        "raw_video_content": c
    }

    # 改行コードの正規化
    clean_text = (c.get('text') or "").replace('<br>', '\n').replace('<br />', '\n')

    product = {
        'api_source': source.lower(),
        'api_product_id': cid,
        'product_id_unique': generate_product_unique_id(source, cid),
        'title': c.get('title'),
        'api_service': 'digital',
        'floor_code': 'videoa', 
        'product_description': clean_text[:300], 
        'rich_description': clean_text,         
        'release_date': parse_date(c.get('releaseDate').replace('/', '-')) if c.get('releaseDate') else None,
        'image_url_list': {"main": img_l} if img_l else {},
        'sample_movie_url': movie_info, 
        'volume': str(_safe_int(c.get('runtime') or c.get('count'))),
        'updated_at': timezone.now(),
        'is_active': True,
    }

    prices = c.get('digitalVideoPrices', [])
    if prices:
        product['price'] = min([_safe_int(p.get('price')) for p in prices if p.get('price')])

    rel = {
        'api_product_id': cid,
        'maker': c['makers'][0].get('name') if c.get('makers') else c.get('makerName'),
        'label': c.get('labelName'),
        'series': c.get('seriesName'),
        'director': c.get('directorName'),
        'genres': [g.get('name') for g in c.get('tags', []) if g.get('name')],
        'people_all': [a.get('name') for a in c.get('actors', []) if a.get('name')],
    }
    
    return [product], [rel]

def _parse_api_flow(items: list, raw_json: dict, source: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """API (json.items) 形式のデータを解析"""
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

        movie_info = {
            "content_id": cid,
            "sample_movie_url": data.get('sampleMovieURL', {}),
            "affiliate_url": data.get('affiliateURL')
        }
        
        imgs = {"main": _optimize_fanza_url(data.get('imageURL', {}).get('large'))}

        p_list.append({
            'api_source': source.lower(),
            'api_product_id': str(cid),
            'product_id_unique': generate_product_unique_id(source, str(cid)),
            'title': data.get('title'),
            'api_service': data.get('service_code') or req_params.get('service'),
            'floor_code': data.get('floor_code') or req_params.get('floor'),
            'product_description': data.get('description'),
            'rich_description': data.get('description'), 
            'release_date': parse_date(data.get('date').split(' ')[0]) if data.get('date') else None,
            'affiliate_url': data.get('affiliateURL') or "",
            'price': _safe_int(data.get('prices', {}).get('price')),
            'is_unlimited': is_unl,
            'volume': str(_safe_int(data.get('volume'))), 
            'maker_product_id': data.get('stock_number'),
            'image_url_list': imgs,
            'sample_movie_url': movie_info,
            'tachiyomi_url': data.get('URL') if is_unl else None,
            'updated_at': timezone.now(),
            'is_active': True,
        })
        
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