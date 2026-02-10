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
API_SOURCE = 'DUGA' 

def _optimize_duga_url(url: Optional[str]) -> str:
    """
    DUGA/DMMの画像URLを正規表現で最高画質(Large)に変換する内部関数
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

def normalize_duga_data(raw_data_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    DUGAのJSONデータを抽出し、正規化された辞書形式のリストを返します。
    画像および動画プレビューは最高解像度(Large)へ自動変換し、JSON形式で保持します。
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

    # --- 📸 画像URLの抽出と高画質化 ---
    image_url_list = []
    seen_urls = set()
    
    def add_url(raw_url):
        if not raw_url:
            return
        optimized = _optimize_duga_url(raw_url)
        if optimized and optimized not in seen_urls:
            image_url_list.append(optimized)
            seen_urls.add(optimized)

    # 1. ジャケット画像
    jackets = data.get('jacketimage', [])
    if isinstance(jackets, list):
        for j in jackets:
            for size in ['large', 'midium', 'small']:
                add_url(j.get(size))

    # 2. ポスター画像
    posters = data.get('posterimage', [])
    if isinstance(posters, list):
        for p in posters:
            for size in ['large', 'midium', 'small']:
                add_url(p.get(size))

    # 3. 商品内キャプチャ
    thumbnails = data.get('thumbnail', [])
    if isinstance(thumbnails, list):
        for t in thumbnails:
            add_url(t.get('image'))
    
    # --- 🎥 サンプル動画データ (JSON形式) ---
    sample_movies = data.get('samplemovie', [])
    movie_json_data = {} # JSONField用
    
    if isinstance(sample_movies, list) and sample_movies:
        # 優先度の高い動画情報を取得
        m_info = sample_movies[0].get('midium') or sample_movies[0].get('large') or sample_movies[0].get('small') or {}
        movie_url = m_info.get('movie', "")
        capture_url = m_info.get('capture', "")
        
        if movie_url:
            movie_json_data = {
                'url': movie_url,
                'preview_image': _optimize_duga_url(capture_url) # キャプチャも最高画質化
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
        'image_url_list': image_url_list,  # JSONField: 高画質画像リスト
        'sample_movie_url': movie_json_data if movie_json_data else None, # JSONField: 動画URL+高画質キャプチャ
        
        'maker': maker_name,
        'label': label_name,
        'series': series_name, 
        'director': director_name,
        
        'raw_data_id': raw_data_instance.id,
        'updated_at': timezone.now(),
        'is_active': True,
        'is_posted': False,
    }
    
    # --- ManyToManyリレーション用辞書 ---
    relations_dict = {
        'api_product_id': str(api_product_id),
        'genres': [c.get('data', {}).get('name') for c in data.get('category', []) if c.get('data', {}).get('name')],
        'actresses': [p.get('data', {}).get('name') for p in data.get('performer', []) if p.get('data', {}).get('name')],
    }

    return [product_dict], [relations_dict]