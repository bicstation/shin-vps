import json
from datetime import datetime
from django.utils.dateparse import parse_date
import logging
from typing import List, Tuple, Dict, Any, Optional

# 必要なモデル（実際の環境に合わせてインポートパスを確認してください）
from api.models import RawApiData, Maker, Label, Series, Director, Actress, Genre
# get_or_create_entity のインポート (シグネチャ変更に対応)
from .entity_manager import get_or_create_entity 
from .common import generate_product_unique_id 

logger = logging.getLogger('api_utils')
logger.setLevel(logging.INFO) # INFOレベル以上でログが出力されます

# DUGAのAPIソース定数
API_SOURCE = 'DUGA' 

def normalize_duga_data(raw_data_instance: RawApiData) -> tuple[list[dict], list[dict]]:
    """
    RawApiDataインスタンス (DUGA) のJSONデータから、Productデータ辞書とリレーション情報を含む
    辞書を構築する。
    """
    
    # ------------------------------------------------------------------
    # 0. Raw JSONデータのデコードと必要なデータの抽出
    # ------------------------------------------------------------------
    try:
        raw_json_data = raw_data_instance.raw_json_data
        
        if isinstance(raw_json_data, str):
            data = json.loads(raw_json_data) 
        elif isinstance(raw_json_data, dict):
            data = raw_json_data
        else:
            raise TypeError("Raw JSONデータが文字列または辞書形式ではありません。")
            
        if not isinstance(data, dict):
            raise ValueError("デコード後のデータが製品データ（辞書形式）ではありません。")

    except json.JSONDecodeError as e:
        logger.error(f"RawApiData ID {raw_data_instance.id} のデコード中にJSONエラー: 無効なJSON文字列です。エラー: {e}")
        return [], []
    except (TypeError, ValueError) as e:
        logger.error(f"RawApiData ID {raw_data_instance.id} のデコード中にエラー: {e}")
        return [], []
    except Exception as e:
        logger.error(f"RawApiData ID {raw_data_instance.id} の予期せぬエラー: {e}")
        return [], []

    # ------------------------------------------------------------------
    # 1. コア情報の抽出と検証 (必須フィールド)
    # ------------------------------------------------------------------
    
    api_product_id = data.get('productid')
    title = data.get('title')
    
    if not api_product_id or not title:
        logger.warning(f"DUGAデータ (Raw ID: {raw_data_instance.id}) で productid または title が不足。スキップ。")
        return [], [] 

    # ------------------------------------------------------------------
    # 2. エンティティのIDを取得・作成 (ForeignKey)
    # ------------------------------------------------------------------
    
    # Maker (メーカー)
    maker_name = data.get('makername')
    maker_names = [maker_name] if maker_name else []
    # ★修正: リストと API_SOURCE を渡す
    maker_map = get_or_create_entity(Maker, maker_names, API_SOURCE) 
    maker_id = maker_map.get(maker_name) if maker_name else None

    # Label (レーベル)
    labels_list = data.get('label', [])
    label_name = labels_list[0].get('name') if labels_list and isinstance(labels_list[0], dict) else None
    label_names = [label_name] if label_name else []
    # ★修正: リストと API_SOURCE を渡す
    label_map = get_or_create_entity(Label, label_names, API_SOURCE) 
    label_id = label_map.get(label_name) if label_name else None

    # Director (監督)
    director_data = data.get('director')
    director_name = director_data[0].get('name') if isinstance(director_data, list) and director_data and isinstance(director_data[0], dict) else None
    director_names = [director_name] if director_name else []
    # ★修正: リストと API_SOURCE を渡す
    director_map = get_or_create_entity(Director, director_names, API_SOURCE) 
    director_id = director_map.get(director_name) if director_name else None

    # Series (シリーズ)
    series_id = None 
    
    # ------------------------------------------------------------------
    # 3. リレーションエンティティのIDを取得・収集 (ManyToMany)
    # ------------------------------------------------------------------
    
    genre_ids = []
    actress_ids = []
    
    # Genre (ジャンル)
    raw_genre_names = []
    genres_data = data.get('category', [])
    if isinstance(genres_data, list):
        for item in genres_data:
            genre_name = item.get('data', {}).get('name')
            if genre_name:
                raw_genre_names.append(genre_name)

    # ★修正: get_or_create_entity で一括取得
    genre_map = get_or_create_entity(Genre, raw_genre_names, API_SOURCE)
    genre_ids = list(genre_map.values())

    # Actress (女優)
    raw_actress_names = []
    actresses_data = data.get('performer', [])
    if isinstance(actresses_data, list):
        for item in actresses_data:
            actress_name = item.get('data', {}).get('name')
            if actress_name:
                raw_actress_names.append(actress_name)
    
    # ★修正: get_or_create_entity で一括取得
    actress_map = get_or_create_entity(Actress, raw_actress_names, API_SOURCE)
    actress_ids = list(actress_map.values())


    # ------------------------------------------------------------------
    # 4. その他のフィールドの正規化
    # ------------------------------------------------------------------
    
    # リリース日の整形
    raw_date_str = data.get('releasedate')
    release_date = parse_date(raw_date_str.replace('/', '-')) if raw_date_str and '/' in raw_date_str else None
    
    # 価格の整形 (最安値を取得)
    saletype_list = data.get('saletype', [])
    min_price = None
    if isinstance(saletype_list, list):
        prices = []
        for saletype in saletype_list:
            price_str = saletype.get('data', {}).get('price')
            if price_str and price_str.isdigit():
                try:
                    prices.append(int(price_str))
                except (ValueError, TypeError):
                    pass
        if prices:
            min_price = min(prices)
    
    # アフィリエイトURL
    affiliate_url = data.get('affiliateurl') or ""
    
    # 画像URLリストの整形
    image_url_list = []
    
    # 1. メイン画像 (ジャケット/ポスターのLargeサイズ) の抽出
    jacket_images = data.get('jacketimage', [])
    large_jacket_url = next(
        (item.get('large') for item in jacket_images if isinstance(item, dict) and item.get('large')),
        None
    )
    if large_jacket_url:
        image_url_list.append(large_jacket_url)

    # b) jacketimage がない場合は posterimage (Largeサイズ) を抽出
    if not large_jacket_url:
        poster_images = data.get('posterimage', [])
        large_poster_url = next(
            (item.get('large') for item in poster_images if isinstance(item, dict) and item.get('large')),
            None
        )
        if large_poster_url:
            image_url_list.append(large_poster_url)

    # 2. サンプル画像 (thumbnail) の抽出と結合
    thumbnail_data = data.get('thumbnail', [])
    if thumbnail_data and isinstance(thumbnail_data, list):
        sample_urls = [
            item.get('image') 
            for item in thumbnail_data 
            if isinstance(item, dict) and item.get('image')
        ]
        image_url_list.extend(sample_urls)
    
    # 重複を排除し、最終リストを確定
    image_url_for_db = list(dict.fromkeys(image_url_list)) 

    # ★★★ ここにデバッグ用ログを追加 ★★★
    if not image_url_for_db:
        logger.warning(f"[DEBUG] Raw ID: {raw_data_instance.id} ({api_product_id}) - 画像URLリストが空です。")
    else:
        # 最初の2つのURLのみを表示（ログが長くなりすぎるのを防ぐため）
        logger.info(f"[DEBUG] Raw ID: {raw_data_instance.id} ({api_product_id}) - 画像URL {len(image_url_for_db)}件を抽出しました: {image_url_for_db[:2]}...")
    # ★★★ デバッグ用ログの追加 終了 ★★★
    
    # ------------------------------------------------------------------
    # 5. 結果の構築
    # ------------------------------------------------------------------

    # Product モデル用のデータ辞書
    product_data = {
        'api_source': API_SOURCE,
        'api_product_id': api_product_id,
        'product_id_unique': generate_product_unique_id(API_SOURCE, api_product_id), 
        'title': title,
        'release_date': release_date,
        'affiliate_url': affiliate_url, 
        'price': min_price,
        'image_url_list': image_url_for_db,
        'maker_id': maker_id,
        'label_id': label_id,
        'series_id': series_id, 
        'director_id': director_id,
        'raw_data_id': raw_data_instance.id,
        'updated_at': datetime.now(),
        'is_active': True,
    }
    
    # リレーションシップ用のデータ辞書
    relations_data = {
        'genre_ids': genre_ids,
        'actress_ids': actress_ids,
    }

    return [product_data], [relations_data]