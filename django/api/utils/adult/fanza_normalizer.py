# -*- coding: utf-8 -*-
import json
import logging
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

def normalize_fanza_data(raw_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    RawApiData のレコードを正規化する。
    生データの api_source を参照し、FANZAとDMMを動的に切り替えて「取りこぼし」を防ぎます。
    """
    products_data_list = []
    relations_list = []
    
    # 💡 修正ポイント：生データのソース（'FANZA' か 'DMM'）を動的に取得
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
        logger.error(f"RawApiData ID {raw_instance.id} のデコード中にエラー: '{e}'")
        return [], []

    if not items:
        return [], []

    for data in items:
        api_product_id = data.get('content_id')
        title = data.get('title')
        
        if not api_product_id or not title:
            continue

        item_info = data.get('iteminfo', {})
        
        # 1. 各種エンティティ抽出
        maker_name, _ = _safe_extract_single_entity(item_info, 'maker')
        label_name, _ = _safe_extract_single_entity(item_info, 'label')
        series_name, _ = _safe_extract_single_entity(item_info, 'series')
        director_name, _ = _safe_extract_single_entity(item_info, 'director')
        
        # 2. ジャンル・女優リスト
        genre_names = [g.get('name') for g in item_info.get('genre', []) if g.get('name')]
        actress_names = [a.get('name') for a in item_info.get('actress', []) if a.get('name')]
        
        # 3. 画像URLリストの正規化（高品質優先ロジック）
        image_url_list = []
        image_data = data.get('imageURL', {})
        sample_image_dict = data.get('sampleImageURL', {})

        def _format_url(url: str) -> str:
            if url and url.startswith('//'):
                return 'https:' + url
            return url or ""

        # 優先順位：パッケージ大 -> サンプル大 -> パッケージ小 -> サンプル小
        best_main = _format_url(image_data.get('large'))
        if best_main:
            image_url_list.append(best_main)

        sample_l_list = sample_image_dict.get('sample_l', {}).get('image', [])
        if isinstance(sample_l_list, list):
            for img in sample_l_list:
                f_img = _format_url(img)
                if f_img and f_img not in image_url_list:
                    image_url_list.append(f_img)

        for sub_key in ['small', 'list']:
            sub_img = _format_url(image_data.get(sub_key))
            if sub_img and sub_img not in image_url_list:
                image_url_list.append(sub_img)

        # 4. サンプル動画URL
        movie_urls = data.get('sampleMovieURL', {})
        sample_movie = _format_url(movie_urls.get('size_720_480') or movie_urls.get('size_644_414') or "")

        # 5. 価格の数値化
        price_val = None
        price_raw = data.get('prices', {}).get('price')
        if price_raw:
            try:
                price_clean = str(price_raw).replace('~', '').replace(',', '').strip()
                if price_clean.isdigit():
                    price_val = int(price_clean)
            except:
                price_val = None
        
        # 6. Djangoモデル（AdultProduct）の構造に合わせて集約
        # 💡 修正ポイント：実際のソースを使って一意のID（DMM_xxx や FANZA_xxx）を生成
        product_id_unique = generate_product_unique_id(actual_source, str(api_product_id))
        
        product_data = {
            'api_source': actual_source, # 💡 ここで DMM か FANZA が保存される
            'api_product_id': str(api_product_id),
            'product_id_unique': product_id_unique,
            'title': title,
            'release_date': parse_date(data.get('date').split(' ')[0]) if data.get('date') else None,
            'affiliate_url': data.get('affiliateURL') or "", 
            'price': price_val,
            'image_url_list': image_url_list,
            'sample_movie_url': sample_movie,
            'maker': maker_name,
            'label': label_name,
            'series': series_name,
            'director': director_name,
            'raw_data_id': raw_instance.id,
            'updated_at': timezone.now(),
            'is_active': True,
            'is_posted': False,
        }
        
        products_data_list.append(product_data)
        
        # 7. 多対多リレーション用データ
        relations_list.append({
            'api_product_id': str(api_product_id),
            'genres': genre_names,
            'actresses': actress_names,
        })

    return products_data_list, relations_list