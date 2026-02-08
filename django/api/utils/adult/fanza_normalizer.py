# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime
from django.utils.dateparse import parse_date
from typing import List, Tuple, Dict, Any, Optional

# 必要なモデルとユーティリティ
from api.models import RawApiData
from api.utils.common import generate_product_unique_id 

# ロガー設定
logger = logging.getLogger('api_utils')

# FANZAのAPIソース定数
API_SOURCE = 'FANZA'

def _safe_extract_single_entity(item_info_content: dict, key: str) -> tuple[Optional[str], Optional[str]]:
    """
    FANZAのデータ構造に合わせて、単一のエンティティの名前とAPI IDを抽出する。
    iteminfo内のmaker, label, series, directorなどの辞書またはリストに対応。
    """
    data = item_info_content.get(key)
    if not data:
        return None, None
    
    # リスト形式で届く場合があるため、最初の要素を取得
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
    RawApiData (FANZA) のレコードを正規化する。
    動画URLの確実な取得とプロトコル補完を含めた完全版。
    """
    products_data_list = []
    relations_list = []
    
    try:
        raw_data = getattr(raw_instance, 'raw_json_data', None)
        if raw_data is None:
            return [], []

        # データ型の判定とデコード
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
        # 基本識別子
        api_product_id = data.get('content_id')
        title = data.get('title')
        
        if not api_product_id or not title:
            continue

        # 詳細情報階層
        item_info = data.get('iteminfo', {})
        
        # 1. 各種エンティティ抽出（メーカー、レーベル、シリーズ、監督）
        maker_name, _ = _safe_extract_single_entity(item_info, 'maker')
        label_name, _ = _safe_extract_single_entity(item_info, 'label')
        series_name, _ = _safe_extract_single_entity(item_info, 'series')
        director_name, _ = _safe_extract_single_entity(item_info, 'director')
        
        # 2. ジャンル・女優リスト（M2Mリレーション用）
        genre_names = [g.get('name') for g in item_info.get('genre', []) if g.get('name')]
        actress_names = [a.get('name') for a in item_info.get('actress', []) if a.get('name')]
        
        # 3. 画像URLリストの正規化
        image_url_list = []
        image_data = data.get('imageURL', {})
        
        # メイン画像
        main_image = image_data.get('large') or image_data.get('list')
        if main_image:
            # プロトコル補完
            if main_image.startswith('//'): main_image = 'https:' + main_image
            image_url_list.append(main_image)
            
        # サンプル画像
        sample_image_dict = data.get('sampleImageURL', {})
        sample_images = sample_image_dict.get('sample_l', {}).get('image') or sample_image_dict.get('sample_s', {}).get('image')
        
        if sample_images:
            if isinstance(sample_images, list):
                for img in sample_images:
                    if img.startswith('//'): img = 'https:' + img
                    if img not in image_url_list:
                        image_url_list.append(img)
            elif isinstance(sample_images, str):
                if sample_images.startswith('//'): sample_images = 'https:' + sample_images
                if sample_images not in image_url_list:
                    image_url_list.append(sample_images)

        # 4. サンプル動画URLの抽出（高画質を優先）
        movie_urls = data.get('sampleMovieURL', {})
        sample_movie = (
            movie_urls.get('size_720_480') or 
            movie_urls.get('size_644_414') or 
            movie_urls.get('size_560_360') or 
            movie_urls.get('size_476_306') or 
            ""
        )

        # プロトコル補完
        if sample_movie and sample_movie.startswith('//'):
            sample_movie = 'https:' + sample_movie
        
        # 最終ガード
        if sample_movie is None:
            sample_movie = ""

        # 5. 価格の数値化
        price_val = None
        price_raw = data.get('prices', {}).get('price')
        if price_raw:
            try:
                # 記号を除去して整数化
                price_clean = str(price_raw).replace('~', '').replace(',', '').strip()
                if price_clean.isdigit():
                    price_val = int(price_clean)
            except:
                price_val = None
        
        # 6. Djangoモデル（AdultProduct）の構造に合わせて集約
        product_id_unique = generate_product_unique_id(API_SOURCE, str(api_product_id))
        
        product_data = {
            'api_source': API_SOURCE,
            'api_product_id': str(api_product_id),
            'product_id_unique': product_id_unique,
            'title': title,
            'release_date': parse_date(data.get('date').split(' ')[0]) if data.get('date') else None,
            'affiliate_url': data.get('affiliateURL') or "", 
            'price': price_val,
            'image_url_list': image_url_list,
            'sample_movie_url': sample_movie,
            
            # 外部キー用（後にIDに置換される文字列）
            'maker': maker_name,
            'label': label_name,
            'series': series_name,
            'director': director_name,
            
            'raw_data_id': raw_instance.id,
            'updated_at': datetime.now(),
            'is_active': True,
            'is_posted': False,
        }
        
        products_data_list.append(product_data)
        
        # 7. 多対多（ManyToMany）リレーション用データの分離
        # コマンド側の _synchronize_relations との紐付けのため 'api_product_id' を使用
        relations_list.append({
            'api_product_id': str(api_product_id),
            'genres': genre_names,
            'actresses': actress_names,
        })

    return products_data_list, relations_list