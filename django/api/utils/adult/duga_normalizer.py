# -*- coding: utf-8 -*-
import json
import logging
from datetime import datetime
from django.utils.dateparse import parse_date
from typing import List, Tuple, Dict, Any, Optional

from api.models import RawApiData
from api.utils.common import generate_product_unique_id 

logger = logging.getLogger('api_utils')
API_SOURCE = 'DUGA' 

def normalize_duga_data(raw_data_instance: RawApiData) -> tuple[list[dict], list[dict]]:
    """
    DUGAのJSONデータを抽出し、正規化された辞書形式のリストを返します。
    ForeignKey対象（Maker, Label, Director, Series）は名前文字列のまま保持し、
    ManyToMany対象（Genre, Actress）も名前のリストとして保持します。
    """
    try:
        raw_json_data = getattr(raw_data_instance, 'raw_json_data', None)
        if isinstance(raw_json_data, str):
            data = json.loads(raw_json_data) 
        else:
            data = raw_json_data or {}

        if not isinstance(data, dict):
            logger.warning(f"RawApiData ID {raw_data_instance.id}: データが辞書形式ではありません。")
            return [], []

    except Exception as e:
        logger.error(f"RawApiData ID {raw_data_instance.id} デコードエラー: {e}")
        return [], []

    # 必須項目のチェック
    api_product_id = data.get('productid')
    title = data.get('title')
    if not api_product_id or not title:
        return [], [] 

    # --- 単一エンティティ名の抽出 ---
    maker_name = data.get('makername')
    
    labels = data.get('label', [])
    label_name = labels[0].get('name') if labels and isinstance(labels[0], dict) else None
    
    directors = data.get('director', [])
    director_name = directors[0].get('name') if directors and isinstance(directors[0], dict) else None
    
    series_list = data.get('series', [])
    series_name = series_list[0].get('name') if series_list and isinstance(series_list[0], dict) else None 

    # --- 画像URLの抽出ロジック ---
    image_url_list = []
    jacket = data.get('jacketimage', [])
    poster = data.get('posterimage', [])
    
    main_img = None
    if isinstance(jacket, list) and jacket:
        main_img = jacket[0].get('large')
    if not main_img and isinstance(poster, list) and poster:
        main_img = poster[0].get('large')
    
    if main_img:
        image_url_list.append(main_img)

    thumbnails = data.get('thumbnail', [])
    if isinstance(thumbnails, list):
        for t in thumbnails:
            url = t.get('image')
            if url:
                image_url_list.append(url)
    
    # 重複削除
    image_url_list = list(dict.fromkeys(image_url_list))
    
    # --- サンプル動画URL ---
    sample_movies = data.get('samplemovie', [])
    movie_url = ""
    if isinstance(sample_movies, list) and sample_movies:
        # midiumサイズを優先的に取得
        movie_url = sample_movies[0].get('midium', {}).get('movie', "")

    # --- 日付と価格 ---
    raw_date = data.get('releasedate')
    release_date = None
    if raw_date:
        try:
            release_date = parse_date(raw_date.replace('/', '-'))
        except:
            pass
    
    min_price = None
    saletypes = data.get('saletype', [])
    if isinstance(saletypes, list):
        prices = []
        for s in saletypes:
            p_val = s.get('data', {}).get('price')
            if p_val and str(p_val).isdigit():
                prices.append(int(p_val))
        if prices:
            min_price = min(prices)

    # --- AdultProduct用データ辞書 ---
    product_dict = {
        'api_source': API_SOURCE,
        'api_product_id': str(api_product_id),
        'product_id_unique': generate_product_unique_id(API_SOURCE, str(api_product_id)), 
        'title': title,
        'release_date': release_date,
        'affiliate_url': data.get('affiliateurl') or "", 
        'price': min_price,
        'image_url_list': image_url_list,
        'sample_movie_url': movie_url,
        
        # 管理コマンドでPKに変換される一時キー
        'maker': maker_name,
        'label': label_name,
        'series': series_name, 
        'director': director_name,
        
        'raw_data_id': raw_data_instance.id,
        'is_active': True,
        'is_posted': False,
    }
    
    # --- ManyToManyリレーション用辞書 ---
    relations_dict = {
        'product_id_unique': product_dict['product_id_unique'],
        'genres': [c.get('data', {}).get('name') for c in data.get('category', []) if c.get('data', {}).get('name')],
        'actresses': [p.get('data', {}).get('name') for p in data.get('performer', []) if p.get('data', {}).get('name')],
    }

    return [product_dict], [relations_dict]