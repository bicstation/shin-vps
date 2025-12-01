import json
from datetime import datetime
from django.utils.dateparse import parse_date
import logging

# ログはutils全体で共通のロガーを使用
logger = logging.getLogger('api_utils')
# logger.setLevel(logging.DEBUG) # コマンド側で設定するためここでは不要だが、念のため残しておく

# 必要なモデル
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
        raw_json_data = raw_instance.raw_json_data
        items = raw_json_data.get('result', {}).get('items', [])
    except Exception as e:
        logger.error(f"RawApiData ID {raw_instance.id} のデコード中にエラー: {e}")
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
        # 1. エンティティのIDを取得・作成
        # ------------------------------------------------------------------
        item_info = data.get('iteminfo', {})
        
        # メーカー (Maker)
        maker_name, maker_api_id = _safe_extract_single_entity(item_info, 'maker')
        maker_id = get_or_create_entity(Maker, API_SOURCE, maker_name, maker_api_id) if maker_name else None

        # レーベル (Label)
        label_name, label_api_id = _safe_extract_single_entity(item_info, 'label')
        label_id = get_or_create_entity(Label, API_SOURCE, label_name, label_api_id) if label_name else None

        # シリーズ (Series)
        series_name, series_api_id = _safe_extract_single_entity(item_info, 'series')
        series_id = get_or_create_entity(Series, API_SOURCE, series_name, series_api_id) if series_name else None

        # 監督 (Director)
        director_name, director_api_id = _safe_extract_single_entity(item_info, 'director')
        director_id = get_or_create_entity(Director, API_SOURCE, director_name, director_api_id) if director_name else None
        
        # ------------------------------------------------------------------
        # 2. リレーションエンティティのIDを取得・収集 (Genre, Actress)
        # ------------------------------------------------------------------
        genre_ids = []
        actress_ids = []
        
        # ジャンル (Genre)
        if 'genre' in item_info and isinstance(item_info['genre'], list):
            for genre_data in item_info['genre']:
                genre_name = genre_data.get('name')
                genre_api_id = genre_data.get('id')
                if genre_name:
                    db_id = get_or_create_entity(Genre, API_SOURCE, genre_name, genre_api_id)
                    if db_id:
                        genre_ids.append(db_id)

        # 女優 (Actress)
        if 'actress' in item_info and isinstance(item_info['actress'], list):
            for actress_data in item_info['actress']:
                actress_name = actress_data.get('name')
                actress_api_id = actress_data.get('id')
                if actress_name:
                    # 女優にはapi_idがない場合があるため、名前のみでget_or_create
                    db_id = get_or_create_entity(Actress, API_SOURCE, actress_name, actress_api_id)
                    if db_id:
                        actress_ids.append(db_id)
        
        # ------------------------------------------------------------------
        # 3. 製品データの正規化
        # ------------------------------------------------------------------
        
        # リリース日の整形
        raw_date_str = data.get('date')
        release_date = parse_date(raw_date_str) if raw_date_str else None
        
        # 画像URLリストの整形
        image_url_list = []
        if data.get('imageURL', {}).get('list'):
             image_url_list.append(data['imageURL']['list'])
        if data.get('imageURL', {}).get('sample', {}).get('s'):
             image_url_list.extend(data['imageURL']['sample']['s'])
        
        # ★ 修正: NOT NULL制約回避のため、空の場合は '[]' のJSON文字列を使用
        if not image_url_list:
             image_url_json = "[]"
        else:
             image_url_json = json.dumps(image_url_list)

        # 価格の整形 (価格情報がない場合があるため、Noneを許容)
        price_str = data.get('prices', {}).get('price')
        try:
            price = int(price_str) if price_str else None
        except ValueError:
            price = None
        
        # 正規化された Product モデル用のデータ辞書
        product_data = {
            'api_source': API_SOURCE,
            'api_product_id': api_product_id,
            # ユニークIDは 'FANZA_xxxx' の形式
            'product_id_unique': f'{API_SOURCE}_{api_product_id}', 
            'title': title,
            'release_date': release_date,
            'affiliate_url': data.get('affiliateURL') or "", # ★ 修正: NOT NULL回避
            'price': price,
            'image_url_list': image_url_json, # JSON文字列
            'maker_id': maker_id,
            'label_id': label_id,
            'series_id': series_id,
            'director_id': director_id,
            'raw_data_id': raw_instance.id, # RawApiDataのID
            'updated_at': datetime.now(),
        }
        
        products_data_list.append(product_data)
        
        # リレーションシップ用のデータ辞書
        relations_list.append({
            'api_product_id': api_product_id, # Product.product_id_uniqueと紐づけるためのキー
            'genre_ids': genre_ids,
            'actress_ids': actress_ids,
        })

    return products_data_list, relations_list