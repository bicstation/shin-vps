import json
import logging
from datetime import datetime
from django.utils.dateparse import parse_date
from typing import List, Tuple, Dict, Any, Optional

# ログはutils全体で共通のロガーを使用
logger = logging.getLogger('api_utils')

# 必要なモデル (ここでは参照のみ)
# 実際の環境に合わせてインポートパスを確認してください
from api.models import RawApiData, Maker, Label, Series, Director, Actress, Genre 
# 依存関係は新しい場所からインポート
from .entity_manager import get_or_create_entity
from .common import generate_product_unique_id 

API_SOURCE = 'FANZA' # 定数として定義

def _safe_extract_single_entity(item_info_content: dict, key: str) -> tuple[str | None, str | None]:
    """
    FANZAのデータ構造に合わせて、単一のエンティティ（メーカー、レーベルなど）の名前とAPI IDを抽出する。
    """
    data = item_info_content.get(key)
    if not data:
        return None, None
    if isinstance(data, list):
        if not data:
            return None, None
        data = data[0]
    # 'data' が辞書の場合は 'name' と 'id' を抽出
    if isinstance(data, dict):
        # API IDは必須ではないため、名前だけを返す
        return data.get('name'), data.get('id')
    # 'data' が文字列の場合は、それが名前であると仮定
    elif isinstance(data, str):
        return data, None
    return None, None

def normalize_fanza_data(raw_instance: RawApiData) -> tuple[list[dict], list[dict]]:
    """
    RawApiData (FANZA: 1バッチ) のレコードを読み込み、Productモデルとリレーションに必要なデータに正規化する。
    """
    products_data_list = []
    relations_list = []
    
    # Raw JSONデータのデコード
    try:
        # ----------------------------------------------------------------------
        # RawApiDataの実際のJSONデータフィールド名が 'raw_json_data' であると仮定
        raw_data = getattr(raw_instance, 'raw_json_data', None)
        
        if raw_data is None:
            logger.error(f"RawApiData ID {raw_instance.id} にデータ属性が見つかりません。")
            return [], []

        if isinstance(raw_data, dict):
            raw_json_data = raw_data
        elif isinstance(raw_data, str):
            raw_json_data = json.loads(raw_data)
        else:
            logger.error(f"RawApiData ID {raw_instance.id} のデータ型が不正です (Type: {type(raw_data)})")
            return [], []
            
        items = raw_json_data.get('result', {}).get('items', [])
        
    except json.JSONDecodeError as e:
        logger.error(f"RawApiData ID {raw_instance.id} のJSONデコードエラー: {e}")
        raise 
    except Exception as e:
        logger.error(f"RawApiData ID {raw_instance.id} のデコード中にエラー: '{e}'")
        return [], []

    if not items:
        return [], []

    for data in items:
        # 必要なフィールドが欠けている場合はスキップ
        api_product_id = data.get('content_id')
        title = data.get('title')
        
        if not api_product_id or not title:
            logger.warning(f"FANZAデータ (Raw ID: {raw_instance.id}) で content_id または title が不足。スキップ。")
            continue

        # ------------------------------------------------------------------
        # 1. エンティティの名前とIDを抽出 (PKではなく名前を使用)
        # ------------------------------------------------------------------
        item_info = data.get('iteminfo', {})
        
        # 単一リレーション (名前のみ取得)
        maker_name, _ = _safe_extract_single_entity(item_info, 'maker')
        label_name, _ = _safe_extract_single_entity(item_info, 'label')
        series_name, _ = _safe_extract_single_entity(item_info, 'series')
        director_name, _ = _safe_extract_single_entity(item_info, 'director')
        
        # ------------------------------------------------------------------
        # 2. リレーションエンティティの名前を収集
        # ------------------------------------------------------------------
        genre_names = []
        actress_names = []
        
        # ジャンル (Genre)
        if 'genre' in item_info and isinstance(item_info['genre'], list):
            for genre_data in item_info['genre']:
                genre_name = genre_data.get('name')
                if genre_name:
                    genre_names.append(genre_name)

        # 女優 (Actress)
        if 'actress' in item_info and isinstance(item_info['actress'], list):
            for actress_data in item_info['actress']:
                actress_name = actress_data.get('name')
                if actress_name:
                    actress_names.append(actress_name)
        
        # ------------------------------------------------------------------
        # 3. 製品データの正規化
        # ------------------------------------------------------------------
        
        # リリース日の整形
        raw_date_str = data.get('date')
        release_date = parse_date(raw_date_str) if raw_date_str else None
        
        # 画像URLリストの整形
        image_url_list = []
        
        # メインサムネイル (imageURL.list) を追加
        if data.get('imageURL', {}).get('list'):
             image_url_list.append(data['imageURL']['list'])
             
        # サンプル画像 (sampleImageURL.sample_s.image) を追加
        # 生データに合わせてキーを修正
        sample_image_data = data.get('sampleImageURL', {}).get('sample_s', {}).get('image')
        if sample_image_data and isinstance(sample_image_data, list):
             image_url_list.extend(sample_image_data)
        
        # JSONFieldへの格納を想定し、json.dumps()は使用しない (前回の修正を維持)
        if not image_url_list:
             image_url_for_db = []
        else:
             image_url_for_db = image_url_list

        # 価格の整形 (価格情報がない場合があるため、Noneを許容)
        price_str = data.get('prices', {}).get('price')
        try:
            # "~" が含まれる場合があるため、数値部分のみ抽出
            price = int(price_str.replace('~', '')) if price_str and price_str.replace('~', '').isdigit() else None
        except ValueError:
            price = None
        
        # 正規化された Product モデル用のデータ辞書
        product_data = {
            'api_source': API_SOURCE,
            'api_product_id': api_product_id,
            'product_id_unique': f'{API_SOURCE}_{api_product_id}', 
            'title': title,
            'release_date': release_date,
            'affiliate_url': data.get('affiliateURL') or "", 
            'price': price,
            'image_url_list': image_url_for_db, # Pythonのリストオブジェクトをそのまま格納
            
            # FK IDではなく、エンティティの「名前」を格納
            'maker': maker_name,
            'label': label_name,
            'series': series_name,
            'director': director_name,
            
            'raw_data_id': raw_instance.id, # RawApiDataのID
            'updated_at': datetime.now(),
        }
        
        products_data_list.append(product_data)
        
        # リレーションシップ用のデータ辞書
        # PK IDではなく、エンティティの「名前」を格納
        relations_list.append({
            'api_product_id': api_product_id, # Product.product_id_uniqueと紐づけるためのキー
            'genres': genre_names,
            'actresses': actress_names,
        })

    return products_data_list, relations_list