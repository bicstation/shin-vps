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

# --- 補助ユーティリティ ---

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
    """FANZA/DMM画像URLを最高画質(pl.jpg / _l.jpg)に強制置換"""
    if not url: return ""
    if url.startswith('//'): url = 'https:' + url
    
    # 画像パスの置換: 小・中サイズを大サイズ(pl/l)へ
    if any(d in url for d in ['pics.dmm', 'ebook-assets', 'pics.dmm.co.jp']):
        url = re.sub(r'p[s|t|m]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
        url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
    return url

def _get_best_video_url(movie_node: dict, scraped_content: dict = None) -> Optional[str]:
    """
    API提供の動画URL群、またはスクレイピングデータから最高画質のURLを抽出
    """
    # 1. スクレイピングデータがある場合はそちらを優先（通常より高画質なmp4が含まれるため）
    if scraped_content and 'bitrates' in scraped_content:
        # ビットレートが最も高いものを選択
        sorted_videos = sorted(scraped_content['bitrates'], key=lambda x: _safe_int(x.get('bitrate')), reverse=True)
        if sorted_videos:
            return sorted_videos[0].get('src')

    # 2. APIノードから最大サイズを探す
    if not movie_node: return None
    
    # サイズキーワードの優先順位
    priority_keys = ['size_720_480', 'size_640_480', 'size_476_306']
    for key in priority_keys:
        if url := movie_node.get(key):
            return url
            
    # 見つからない場合は辞書の最初の値を返す
    for k, v in movie_node.items():
        if isinstance(v, str) and v.startswith('http'):
            return v
    return None

def _safe_int(value: Any, default: int = 0) -> int:
    """数値抽出の安全な処理（カンマや通貨記号を除去）"""
    if value is None: return default
    if isinstance(value, int): return value
    clean_val = re.sub(r'[^0-9]', '', str(value))
    if not clean_val: return default
    try: return int(clean_val)
    except: return default

def _parse_date_safe(date_str: Optional[str]) -> Optional[Any]:
    """日付文字列のパース"""
    if not date_str: return None
    try:
        return parse_date(date_str.split(' ')[0].replace('/', '-'))
    except:
        return None

# --- メインロジック ---

def normalize_fanza_data(raw_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """公式API・スクレイピングJSONを自動判別して正規化"""
    actual_source = getattr(raw_instance, 'api_source', 'FANZA').upper()
    try:
        raw_data = getattr(raw_instance, 'raw_json_data', None)
        if not raw_data: return [], []
        
        raw_json_data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
        
        # 1. スクレイピングデータ単体の場合
        if 'props' in raw_json_data and 'pageProps' in raw_json_data['props']:
            return _parse_scraping_flow(raw_json_data, actual_source)
            
        # 2. 公式API形式（result.items配下）の場合
        if 'result' in raw_json_data and 'items' in raw_json_data['result']:
            items = raw_json_data['result']['items']
            return _parse_api_flow(items, raw_json_data, actual_source)
            
    except Exception as e:
        logger.error(f"RawApiData ID {raw_instance.id} 解析エラー: {e}")
    return [], []

def _parse_scraping_flow(json_data: dict, source: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """__NEXT_DATA__形式のスクレイピングデータを解析（最高画質・詳細説明・価格網羅）"""
    try:
        page_props = json_data.get('props', {}).get('pageProps', {})
        queries = page_props.get('dehydratedState', {}).get('queries', [])
        
        c = next((q['state']['data']['videoContent'] for q in queries 
                  if isinstance(q.get('state', {}).get('data'), dict) and 'videoContent' in q['state']['data']), None)
        
        affiliate_id = page_props.get('affiliateId', 'default-990')
    except:
        return [], []

    if not c: return [], []

    cid = str(c.get('id') or c.get('contentId'))
    img_main = _optimize_fanza_url(c.get('imgSrcLarge') or c.get('imgSrc'))
    clean_text = (c.get('text') or "").replace('<br>', '\n').replace('<br />', '\n')

    # 価格情報の精査（デジタル配信の全プランから最安値を取得）
    digital_prices = c.get('digitalVideoPrices', [])
    price_list = [_safe_int(p.get('price')) for p in digital_prices if p.get('price') is not None]
    price = min(price_list) if price_list else 0

    product = {
        'api_source': source.lower(),
        'api_product_id': cid,
        'product_id_unique': generate_product_unique_id(source, cid),
        'title': c.get('title'),
        'api_service': 'digital',
        'floor_code': 'videoa', 
        'product_description': clean_text[:300], 
        'rich_description': clean_text,         
        'release_date': _parse_date_safe(c.get('releaseDate')),
        'image_url_list': [img_main] if img_main else [],
        'sample_movie_url': {
            "default_url": _get_best_video_url({}, c),
            "content_id": cid,
            "affiliate_id": affiliate_id,
            "all_bitrates": c.get('bitrates', [])
        }, 
        'price': price,
        'volume': str(_safe_int(c.get('runtime') or c.get('count'))),
        'updated_at': timezone.now(),
        'is_active': True,
    }

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
    """API形式のデータを解析。画像最高画質化、価格バリエーション、詳細説明文を統合。"""
    p_list, r_list = [], []
    req_params = raw_json.get('request', {}).get('parameters', {})
    
    # 内部にスクレイピングJSONが同梱されている場合のMap作成
    scraping_map = {}
    try:
        queries = raw_json.get('props', {}).get('pageProps', {}).get('dehydratedState', {}).get('queries', [])
        for q in queries:
            v_content = q.get('state', {}).get('data', {}).get('videoContent')
            if v_content and (v_id := v_content.get('id')):
                scraping_map[str(v_id)] = v_content
    except:
        pass

    for data in items:
        cid = str(data.get('content_id', ''))
        if not cid: continue
        
        item_info = data.get('iteminfo', {})
        scraped_data = scraping_map.get(cid, {})

        # 1. テキスト（スクレイピング優先）
        api_desc = data.get('description', '')
        rich_desc = scraped_data.get('text', api_desc).replace('<br>', '\n').replace('<br />', '\n')

        # 2. 画像（最高画質化）
        image_urls = data.get('imageURL', {})
        optimized_images = [_optimize_fanza_url(v) for v in image_urls.values() if v]
        
        sample_images = []
        raw_sample_node = data.get('sampleImageURL', {})
        if 'sample_s' in raw_sample_node:
            sample_images = [_optimize_fanza_url(u) for u in raw_sample_node['sample_s'].get('image', [])]

        # 3. 価格（APIの価格リストから最安値を特定）
        prices_node = data.get('prices', {})
        price = _safe_int(prices_node.get('price'))
        list_price = _safe_int(prices_node.get('list_price'))
        
        # deliveries（配信形式別価格）がある場合、その中の最小値を採用
        delivery_prices = [_safe_int(d.get('price')) for d in prices_node.get('deliveries', []) if d.get('price')]
        if delivery_prices:
            price = min(delivery_prices)

        # 4. キャンペーン
        campaign_node = data.get('campaign', {})
        campaign_end = None
        if c_end_str := campaign_node.get('date_end'):
            try:
                campaign_end = timezone.make_aware(timezone.datetime.strptime(c_end_str, '%Y-%m-%d %H:%M:%S'))
            except: pass

        # 5. 動画（最高画質を選択）
        movie_info = {
            'default_url': _get_best_video_url(data.get('sampleMovieURL', {}), scraped_data),
            'raw_api_data': data.get('sampleMovieURL', {}),
            'scraped_bitrates': scraped_data.get('bitrates', [])
        }

        is_unl = (req_params.get('service') == 'unlimited_book' or '読み放題' in (data.get('service_name') or ''))

        p_list.append({
            'api_source': source.lower(),
            'api_product_id': cid,
            'product_id_unique': generate_product_unique_id(source, cid),
            'title': data.get('title'),
            'api_service': data.get('service_code') or req_params.get('service'),
            'floor_code': data.get('floor_code') or req_params.get('floor'),
            'product_description': api_desc[:300],
            'rich_description': rich_desc, 
            'release_date': _parse_date_safe(data.get('date')),
            'affiliate_url': data.get('affiliateURL') or "",
            'price': price,
            'list_price': list_price,
            'price_all_options': prices_node.get('deliveries', []),
            'is_on_sale': (list_price > price) if list_price and price else False,
            'campaign_title': campaign_node.get('title'),
            'campaign_date_end': campaign_end,
            'image_url_list': optimized_images,
            'sample_image_list': sample_images,
            'sample_movie_url': movie_info,
            'is_unlimited': is_unl,
            'volume': str(_safe_int(data.get('volume'))), 
            'maker_product_id': data.get('stock_number'),
            'tachiyomi_url': data.get('URL') if is_unl else None,
            'updated_at': timezone.now(),
            'is_active': True,
        })
        
        # リレーション抽出（網羅性を高める）
        m_name, _ = _safe_extract_single_entity(item_info, 'maker')
        if not m_name: m_name, _ = _safe_extract_single_entity(item_info, 'manufacture')

        all_p = (item_info.get('actress', []) + item_info.get('author', []) + 
                 item_info.get('artist', []) + item_info.get('cast', []) + 
                 item_info.get('voice_actor', []))
        p_names = list(dict.fromkeys([p.get('name') for p in all_p if p.get('name')]))

        r_list.append({
            'api_product_id': cid,
            'maker': m_name,
            'label': _safe_extract_single_entity(item_info, 'label')[0],
            'series': _safe_extract_single_entity(item_info, 'series')[0],
            'director': _safe_extract_single_entity(item_info, 'director')[0],
            'genres': [g.get('name') for g in item_info.get('genre', []) if g.get('name')],
            'people_all': p_names,
        })
        
    return p_list, r_list