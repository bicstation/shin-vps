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
    画像は全解像度を保持し、動画はURLとプレビュー画像のペアを辞書形式で保持します。
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

    # --- 📸 画像URLの抽出ロジック（全解像度網羅版） ---
    image_url_list = []
    
    # 1. ジャケット画像 (最優先: large -> midium -> small)
    jackets = data.get('jacketimage', [])
    if isinstance(jackets, list):
        for j in jackets:
            for size in ['large', 'midium', 'small']:
                url = j.get(size)
                if url:
                    image_url_list.append(url)

    # 2. ポスター画像 (次に優先: large -> midium -> small)
    posters = data.get('posterimage', [])
    if isinstance(posters, list):
        for p in posters:
            for size in ['large', 'midium', 'small']:
                url = p.get(size)
                if url:
                    image_url_list.append(url)

    # 3. 商品内キャプチャ（サムネイル一覧）
    thumbnails = data.get('thumbnail', [])
    if isinstance(thumbnails, list):
        for t in thumbnails:
            url = t.get('image')
            if url:
                image_url_list.append(url)
    
    # 順序を維持したまま重複削除
    # index[0]には常に最も解像度の高いジャケット(jacket.jpg)が来るようになります
    image_url_list = list(dict.fromkeys(image_url_list))
    
    # --- 🎥 サンプル動画データ（動画URL + キャプチャ画像のペア） ---
    sample_movies = data.get('samplemovie', [])
    movie_data = {}
    
    if isinstance(sample_movies, list) and sample_movies:
        # midiumサイズを優先取得、なければ他のサイズ
        m_info = sample_movies[0].get('midium') or sample_movies[0].get('large') or sample_movies[0].get('small') or {}
        movie_url = m_info.get('movie', "")
        movie_capture = m_info.get('capture', "")
        
        if movie_url:
            movie_data = {
                'url': movie_url,
                'preview_image': movie_capture
            }

    # --- 日付のパース ---
    raw_date = data.get('releasedate')
    release_date = None
    if raw_date:
        try:
            release_date = parse_date(raw_date.replace('/', '-'))
        except:
            pass
    
    # --- 価格の最小値取得 ---
    min_price = None
    saletypes = data.get('saletype', [])
    if isinstance(saletypes, list):
        prices = []
        for s in saletypes:
            p_val = s.get('data', {}).get('price')
            if p_val:
                try:
                    # カンマを除去して数値化
                    prices.append(int(str(p_val).replace(',', '')))
                except ValueError:
                    continue
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
        # 💡 モデルのカラム名 'sample_movie_url' に合わせて、辞書からURLのみを抽出して格納
        'sample_movie_url': movie_data if movie_data else None,
        
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