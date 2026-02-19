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

    # DMM/DUGAサーバーの画像であれば置換ロジックを適用
    if any(domain in url for domain in ['pics.dmm', 'duga.jp', 'dg-t.jp']):
        # パターンA: ps.jpg / pt.jpg (Small/Thumb) -> pl.jpg (Large)
        url = re.sub(r'p[s|t]\.jpg', 'pl.jpg', url, flags=re.IGNORECASE)
        # パターンB: _s.jpg / _m.jpg (Small/Medium) -> _l.jpg (Large)
        url = re.sub(r'_[ms]\.jpg', '_l.jpg', url, flags=re.IGNORECASE)
        
    return url

def normalize_duga_data(raw_data_instance: RawApiData) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    DUGAのJSONデータを抽出し、正規化された辞書形式のリストを返します。
    ※ 1つのRawApiDataに複数の商品(items)が含まれているリスト構造に対応。
    """
    try:
        raw_json_data = getattr(raw_data_instance, 'raw_json_data', None)
        
        # 💡 重要: 文字列が二重にエンコードされている場合に備え、辞書になるまでデコード
        data = raw_json_data
        while isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                break

        if not isinstance(data, dict):
            logger.warning(f"RawApiData ID {raw_data_instance.id}: データが辞書形式ではありません。")
            return [], []

        # 💡 重要: DUGAの検索結果APIは "items" 配列の中に商品が入っています
        items_entries = data.get('items', [])
        if not items_entries and data.get('productid'):
            # 直下に商品データがある場合（単体取得時など）のフォールバック
            items_entries = [{'item': data}]

    except Exception as e:
        logger.error(f"RawApiData ID {raw_data_instance.id} デコードエラー: {e}")
        return [], []

    normalized_products = []
    normalized_relations = []

    # 商品リストをループ処理
    for entry in items_entries:
        if not isinstance(entry, dict): continue
        
        # entry["item"] の中に実際のデータが入っています
        item = entry.get('item', {})
        
        # 必須項目のチェック
        api_id = item.get('productid')
        title = item.get('title')
        if not api_id or not title:
            continue 

        # --- 単一エンティティ名の抽出 ---
        maker_name = item.get('makername')
        
        labels = item.get('label', [])
        label_name = labels[0].get('name') if labels and isinstance(labels[0], dict) else None
        
        directors = item.get('director', [])
        director_name = directors[0].get('name') if directors and isinstance(directors[0], dict) else None
        
        series_list = item.get('series', [])
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
        for j in item.get('jacketimage', []):
            if isinstance(j, dict):
                for size in ['large', 'midium', 'small']:
                    add_url(j.get(size))

        # 2. ポスター画像
        for p in item.get('posterimage', []):
            if isinstance(p, dict):
                for size in ['large', 'midium', 'small']:
                    add_url(p.get(size))

        # 3. 商品内キャプチャ
        for t in item.get('thumbnail', []):
            if isinstance(t, dict):
                add_url(t.get('image'))
        
        # --- 🎥 サンプル動画データ ---
        sample_movies = item.get('samplemovie', [])
        movie_json_data = {}
        
        if isinstance(sample_movies, list) and sample_movies:
            # 優先度の高い動画情報を取得
            m_info = sample_movies[0].get('midium') or sample_movies[0].get('large') or sample_movies[0].get('small') or {}
            movie_url = m_info.get('movie', "")
            capture_url = m_info.get('capture', "")
            
            if movie_url:
                movie_json_data = {
                    'url': movie_url,
                    'preview_image': _optimize_duga_url(capture_url)
                }

        # --- 日付のパース ---
        raw_date = item.get('releasedate')
        release_date = None
        if raw_date:
            try:
                release_date = parse_date(raw_date.replace('/', '-'))
            except:
                pass
        
        # --- 価格の最小値取得 ---
        min_price = 0
        saletypes = item.get('saletype', [])
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
        # 💡 content_id (管理コマンドが期待するキー) に修正
        product_dict = {
            'content_id': str(api_id),
            'product_id_unique': generate_product_unique_id(API_SOURCE, str(api_id)), 
            'title': title,
            'summary': item.get('caption', ''),
            'release_date': release_date,
            'affiliate_url': item.get('affiliateurl') or "", 
            'price': min_price,
            'image_url_list': image_url_list,
            'sample_movie_url': movie_json_data if movie_json_data else None,
            
            'maker': maker_name,
            'label': label_name,
            'series': series_name, 
            'director': director_name,
            
            'raw_data_id': raw_data_instance.id,
            'updated_at': timezone.now(),
            'is_active': True,
        }
        
        # --- ManyToManyリレーション用辞書 ---
        relations_dict = {
            'content_id': str(api_id),
            'genres': [c.get('data', {}).get('name') for c in item.get('category', []) if isinstance(c, dict) and c.get('data', {}).get('name')],
            'actresses': [p.get('name') for p in item.get('performer', []) if isinstance(p, dict) and p.get('name')],
            'authors': [], # 明示的に空リストを追加
        }

        normalized_products.append(product_dict)
        normalized_relations.append(relations_dict)

    return normalized_products, normalized_relations