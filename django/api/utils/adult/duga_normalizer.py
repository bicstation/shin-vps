# api/utils/adult/duga_normalizer.py

import json
from datetime import datetime
from django.utils.dateparse import parse_date
import logging
from typing import List, Tuple, Dict, Any, Optional

# 必要なモデル（エンティティ名抽出には不要だが、型ヒントのために残す）
from api.models import RawApiData, Maker, Label, Series, Director, Actress, Genre
# 🚨 【インポート修正点】: 相対インポートを絶対インポートに修正
# (api.utils.common にあると仮定)
from api.utils.common import generate_product_unique_id 

# ロガー設定
logger = logging.getLogger('api_utils')
logger.setLevel(logging.INFO) 

# DUGAのAPIソース定数
API_SOURCE = 'DUGA' 

def normalize_duga_data(raw_data_instance: RawApiData) -> tuple[list[dict], list[dict]]:
    """
    RawApiDataインスタンス (DUGA) のJSONデータから、Productデータ辞書とリレーション情報を含む
    辞書を構築する。

    戻り値:
    - product_data_list: AdultProduct モデルにマッピングされるフィールドのリスト (FKは名前で)
    - relations_data_list: M2Mリレーション (女優、ジャンル) の名前リストを含むリスト
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
    # 2. エンティティの名前を取得 (ForeignKey)
    # ------------------------------------------------------------------
    
    # Maker (メーカー)
    maker_name = data.get('makername')

    # Label (レーベル)
    labels_list = data.get('label', [])
    label_name = labels_list[0].get('name') if labels_list and isinstance(labels_list[0], dict) else None

    # Director (監督)
    director_data = data.get('director')
    director_name = director_data[0].get('name') if isinstance(director_data, list) and director_data and isinstance(director_data[0], dict) else None

    # Series (シリーズ)
    series_name = None # DUGA APIは FANZAほどシリーズ情報を明確に提供しないため、空で保持

    # ------------------------------------------------------------------
    # 3. リレーションエンティティの名前を取得 (ManyToMany)
    # ------------------------------------------------------------------
    
    # Genre (ジャンル)
    raw_genre_names = []
    genres_data = data.get('category', [])
    if isinstance(genres_data, list):
        for item in genres_data:
            genre_name = item.get('data', {}).get('name')
            if genre_name:
                raw_genre_names.append(genre_name)
    # 重複を排除
    raw_genre_names = list(set(raw_genre_names))

    # Actress (女優)
    raw_actress_names = []
    actresses_data = data.get('performer', [])
    if isinstance(actresses_data, list):
        for item in actresses_data:
            actress_name = item.get('data', {}).get('name')
            if actress_name:
                raw_actress_names.append(actress_name)
    # 重複を排除
    raw_actress_names = list(set(raw_actress_names))


    # ------------------------------------------------------------------
    # 4. その他のフィールドの正規化
    # ------------------------------------------------------------------
    
    # リリース日の整形
    raw_date_str = data.get('releasedate')
    release_date = None
    if raw_date_str:
        # 例: 2024/01/01 -> 2024-01-01 に変換してからパース
        parsed_date = parse_date(raw_date_str.replace('/', '-'))
        # parse_date は文字列を返すため、datetime.date オブジェクトに変換
        if parsed_date:
            release_date = parsed_date
    
    # 価格の整形 (最安値を取得)
    min_price = None
    saletype_list = data.get('saletype', [])
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

    if not image_url_for_db:
        logger.warning(f"[DEBUG] Raw ID: {raw_data_instance.id} ({api_product_id}) - 画像URLリストが空です。")
    
    # ------------------------------------------------------------------
    # 5. 結果の構築 (PKではなくエンティティ名を使用)
    # ------------------------------------------------------------------

    # Product モデル用のデータ辞書 (FKフィールドには一時的にエンティティ名を設定)
    product_data = {
        'api_source': API_SOURCE,
        'api_product_id': api_product_id,
        'product_id_unique': generate_product_unique_id(API_SOURCE, api_product_id), 
        'title': title,
        'release_date': release_date,
        'affiliate_url': affiliate_url, 
        'price': min_price,
        'image_url_list': image_url_for_db,
        # IDではなく名前を格納し、後のコマンドでPKに変換させる
        'maker': maker_name,
        'label': label_name,
        'series': series_name, 
        'director': director_name,
        
        'raw_data_id': raw_data_instance.id,
        'updated_at': datetime.now(),
        'is_active': True,
    }
    
    # リレーションシップ用のデータ辞書 (IDではなくエンティティ名リストを使用)
    relations_data = {
        'api_product_id': api_product_id, # 紐付けのために必要
        'product_id_unique': generate_product_unique_id(API_SOURCE, api_product_id), # 紐付け用にユニークIDを追加
        # IDリストではなく、名前リストを格納
        'genres': raw_genre_names,
        'actresses': raw_actress_names,
    }

    return [product_data], [relations_data]