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

logger = logging.getLogger('api_utils')

# --- 共通ユーティリティ ---

def _safe_extract_single_entity(item_info_content: dict, key: str) -> tuple[Optional[str], Optional[str]]:
    """単一エンティティ（メーカー等）の抽出。電子書籍特有のキーにも対応"""
    data = item_info_content.get(key)
    if not data: return None, None
    if isinstance(data, list):
        if not data: return None, None
        data = data[0]
    if isinstance(data, dict):
        return data.get('name'), data.get('id')
    return (data if isinstance(data, str) else None), None

def _optimize_fanza_url(url: Optional[str]) -> str:
    """FANZA/DMM/電子書籍の画像URLを正規表現で最高画質に置換"""
    if not url: return ""
    if url.startswith('//'): url = 'https:' + url
    if any(d in url for d in ['pics.dmm', 'ebook-assets']):
        url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
        url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
    return url

def _safe_int(value: Any, default: int = 0) -> int:
    """ハイフン、カンマ、記号を含む文字列を安全に数値変換する"""
    if value is None:
        return default
    # 数字以外をすべて除去（ハイフン '-' や カンマ ',' も除去される）
    clean_val = re.sub(r'[^0-9]', '', str(value))
    if not clean_val:
        return default
    try:
        return int(clean_val)
    except (ValueError, TypeError):
        return default

# --- 🚀 最強の心臓部（メイン関数） ---

def normalize_fanza_data(raw_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    公式API・読み放題API・詳細スクレイピングJSONを自動判別して正規化します。
    """
    actual_source = getattr(raw_instance, 'api_source', 'FANZA').upper()
    try:
        raw_data = getattr(raw_instance, 'raw_json_data', None)
        if not raw_data: return [], []
        raw_json_data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        
        # 1. スクレイピングデータ (__NEXT_DATA__) の判定
        if 'props' in raw_json_data and 'pageProps' in raw_json_data['props']:
            return _parse_scraping_flow(raw_json_data, actual_source)
            
        # 2. 公式API / 読み放題API (result.items) の判定
        items = raw_json_data.get('result', {}).get('items', [])
        if items:
            return _parse_api_flow(items, raw_json_data, actual_source)
            
    except Exception as e:
        logger.error(f"RawApiData ID {raw_instance.id} 解析致命的エラー: {e}")
    
    return [], []

# --- 🛰️ A: スクレイピング(NextData)パース用 ---

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
        'floor_code': 'videoa',
        'rich_description': c.get('text'), # 濃厚なあらすじ
        'release_date': parse_date(c.get('releaseDate').replace('/', '-')) if c.get('releaseDate') else None,
        'image_url_list': [img_l] if img_l else [],
        'sample_movie_url': {
            'url': c.get('sampleMovieSrc'),
            'preview_image': img_l,
            'iframe_url': f"https://www.dmm.co.jp/litevideo/-/part/=/cid={cid}/size=720_480/"
        } if c.get('sampleMovieSrc') else None,
        'volume': _safe_int(c.get('runtime')),
        'maker': c.get('makerName'),
        'label': c.get('labelName'),
        'series': c.get('seriesName'),
        'director': c.get('directorName'),
        'updated_at': timezone.now(),
        'is_active': True,
    }
    rel = {
        'api_product_id': cid,
        'genres': [g.get('name') for g in c.get('genres', [])],
        'actresses': [a.get('name') for a in c.get('actresses', [])],
        'authors': [],
    }
    return [product], [rel]

# --- 🛰️ B: 公式API & 読み放題パース用 ---

def _parse_api_flow(items: list, raw_json: dict, source: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    p_list, r_list = [], []
    req_params = raw_json.get('request', {}).get('parameters', {})
    is_unlimited_req = (req_params.get('service') == 'unlimited_book')

    for data in items:
        cid = data.get('content_id')
        if not cid: continue
        item_info = data.get('iteminfo', {})
        
        # 特殊エンティティ救出
        maker_n, _ = _safe_extract_single_entity(item_info, 'maker')
        if not maker_n: maker_n, _ = _safe_extract_single_entity(item_info, 'manufacture')
        
        # 読み放題フラグ
        is_unl = is_unlimited_req or '読み放題' in (data.get('service_name') or '')

        # 動画URL最大化
        movie_data = None
        m_raw = data.get('sampleMovieURL')
        if m_raw:
            target = m_raw[0] if isinstance(m_raw, list) else m_raw
            if isinstance(target, dict):
                size_keys = sorted([k for k in target.keys() if k.startswith('size_')], reverse=True)
                path = next((target.get(sk) for sk in size_keys if target.get(sk)), "")
                if path:
                    movie_data = {
                        'url': 'https:' + path if path.startswith('//') else path,
                        'preview_image': _optimize_fanza_url(target.get('pc_flag_images', {}).get('image', [None])[0]),
                        'iframe_url': f"https://www.dmm.co.jp/litevideo/-/part/=/cid={cid}/size=720_480/"
                    }

        # 画像リスト
        imgs = []
        for k in ['large', 'list', 'small']:
            u = _optimize_fanza_url(data.get('imageURL', {}).get(k))
            if u and u not in imgs: imgs.append(u)
        
        p_list.append({
            'api_source': source.lower(),
            'api_product_id': str(cid),
            'product_id_unique': generate_product_unique_id(source, str(cid)),
            'title': data.get('title'),
            'floor_code': req_params.get('floor') or data.get('floor_code', 'videoa'),
            'product_description': data.get('description'),
            'release_date': parse_date(data.get('date').split(' ')[0]) if data.get('date') else None,
            'affiliate_url': data.get('affiliateURL') or "",
            # 修正ポイント: どんな記号が来ても数字だけを抽出
            'price': _safe_int(data.get('prices', {}).get('price')),
            'is_unlimited': is_unl,
            'unlimited_channels': [data.get('service_name')] if is_unl else [],
            'volume': _safe_int(data.get('volume')),
            'maker_product_id': data.get('stock_number'),
            'image_url_list': imgs,
            'sample_movie_url': movie_data,
            'tachiyomi_url': data.get('URL') if is_unl else None,
            'maker': maker_n,
            'label': _safe_extract_single_entity(item_info, 'label')[0],
            'series': _safe_extract_single_entity(item_info, 'series')[0],
            'director': _safe_extract_single_entity(item_info, 'director')[0],
            'updated_at': timezone.now(),
            'is_active': True,
        })
        r_list.append({
            'api_product_id': str(cid),
            'genres': [g.get('name') for g in item_info.get('genre', []) if g.get('name')],
            'actresses': [a.get('name') for a in item_info.get('actress', []) if a.get('name')],
            'authors': [a.get('name') for a in item_info.get('author', []) if a.get('name')],
        })
    return p_list, r_list