import json
from datetime import datetime
from django.utils.dateparse import parse_date
import logging
from api.models import RawApiData, Maker, Label, Series, Director, Actress, Genre
# 依存関係は新しい場所からインポート
from .entity_manager import get_or_create_entity
from .common import generate_product_unique_id 

logger = logging.getLogger('api_utils')
logger.setLevel(logging.DEBUG) 

# DUGAのAPIソース定数
API_SOURCE = 'DUGA' 

def normalize_duga_data(raw_data_instance: RawApiData) -> tuple[list[dict], list[dict]]:
    """
    RawApiDataインスタンス (DUGA) のJSONデータから、Productデータ辞書とリレーション情報を含む
    辞書を構築する。
    
    DUGAのデータ構造をFANZAと同じProduct/Relationsのリスト形式に正規化する。
    """
    
    product_data = {}
    relations_data = {}

    # Raw JSONデータのデコードと必要なデータの抽出
    try:
        raw_json_data = raw_data_instance.raw_json_data
        
        # ★★★ 修正箇所: データ型の確認とデコード処理を導入 ★★★
        if isinstance(raw_json_data, str):
            # 文字列の場合は JSON としてデコード
            data = json.loads(raw_json_data) 
        elif isinstance(raw_json_data, dict):
            # 既に辞書の場合はそのまま (通常は発生しないが安全のため)
            data = raw_json_data
        else:
            # None やその他の型の場合はエラー
            raise TypeError("Raw JSONデータが文字列または辞書形式ではありません。")
            
        if not isinstance(data, dict):
            # デコード後にリストやその他の型になった場合
            raise ValueError("デコード後のデータが製品データ（辞書形式）ではありません。")

    except json.JSONDecodeError as e:
        logger.error(f"RawApiData ID {raw_data_instance.id} のデコード中にJSONエラー: 無効なJSON文字列です。エラー: {e}")
        return [], []
    except (TypeError, ValueError) as e:
        # この行が以前のログエラーの原因（修正前はJSONデコードが抜けていた）
        logger.error(f"RawApiData ID {raw_data_instance.id} のデコード中にエラー: {e}")
        return [], []
    except Exception as e:
        logger.error(f"RawApiData ID {raw_data_instance.id} の予期せぬエラー: {e}")
        return [], []

    # ------------------------------------------------------------------
    # 1. コア情報の抽出と検証 (必須フィールド)
    # ------------------------------------------------------------------
    
    # DUGA API の JSON 構造に合わせてキー名を修正 (例: productid -> id)
    # 以前のデータ例: "{\"productid\": \"jumpbeyond-0023\", ...}"
    api_product_id = data.get('productid') # ★ 'productid' を使用
    title = data.get('title')
    
    # 必須フィールドのチェック
    if not api_product_id or not title:
        logger.warning(f"DUGAデータ (Raw ID: {raw_data_instance.id}) で productid または title が不足。スキップ。")
        # 以前の ValueError を捕捉するために、ここで raise する
        raise ValueError("必須フィールド (productid/Title) が不足しています。")

    # ------------------------------------------------------------------
    # 2. エンティティのIDを取得・作成 (ForeignKey)
    # ------------------------------------------------------------------
    
    # Maker (メーカー)
    maker_name = data.get('makername') # ★ 'makername' を使用
    # DUGAはAPI IDを提供しないため、名前のみで検索/作成
    maker_id = get_or_create_entity(Maker, API_SOURCE, maker_name, None) if maker_name else None

    # Label (レーベル)
    # DUGAデータ例: "label": [{"id": "jumpbeyond", "name": "JUMP BEYOND", ...}]
    labels_list = data.get('label', [])
    label_name = labels_list[0].get('name') if labels_list and isinstance(labels_list[0], dict) else None
    label_id = get_or_create_entity(Label, API_SOURCE, label_name, None) if label_name else None

    # Director (監督) - DUGAのデータ構造によっては 'director' キーがない場合がある
    director_data = data.get('director')
    director_name = director_data[0].get('name') if isinstance(director_data, list) and director_data and isinstance(director_data[0], dict) else None
    director_id = get_or_create_entity(Director, API_SOURCE, director_name, None) if director_name else None

    # Series (シリーズ) - DUGAのAPIレスポンス例からシリーズ情報が見当たらなかったため、一旦 None
    # 必要に応じてデータ構造を確認し、対応する
    series_id = None 
    
    # ------------------------------------------------------------------
    # 3. リレーションエンティティのIDを取得・収集 (ManyToMany)
    # ------------------------------------------------------------------
    
    genre_ids = []
    actress_ids = []
    
    # Genre (ジャンル)
    # DUGAデータ例: "category": [{"data": {"id": "01", "name": "素人"}}]
    genres_data = data.get('category', [])
    if isinstance(genres_data, list):
        for item in genres_data:
            genre_name = item.get('data', {}).get('name')
            if genre_name:
                # DUGAはAPI IDを提供しないため、名前のみで検索/作成
                db_id = get_or_create_entity(Genre, API_SOURCE, genre_name, None)
                if db_id:
                    genre_ids.append(db_id)

    # Actress (女優)
    # DUGAデータ例: "performer": [{"data": {"id": "22078", "name": "羽月果音", "kana": "ﾊﾂﾞｷ ｶﾉﾝ"}}]
    actresses_data = data.get('performer', [])
    if isinstance(actresses_data, list):
        for item in actresses_data:
            actress_name = item.get('data', {}).get('name')
            if actress_name:
                # DUGAはAPI IDを提供しないため、名前のみで検索/作成
                db_id = get_or_create_entity(Actress, API_SOURCE, actress_name, None)
                if db_id:
                    actress_ids.append(db_id)

    # ------------------------------------------------------------------
    # 4. その他のフィールドの正規化
    # ------------------------------------------------------------------
    
    # リリース日の整形
    # DUGAデータ例: "releasedate": "2025/04/22"
    raw_date_str = data.get('releasedate')
    # parse_date は YYYY-MM-DD 形式を期待するため、'/''を'-'に置換して渡す
    release_date = parse_date(raw_date_str.replace('/', '-')) if raw_date_str else None
    
    # 価格の整形 (最安値を取得)
    # DUGAデータ例: "saletype": [{"data": {"type": "通常版", "price": "980"}}, ...]
    saletype_list = data.get('saletype', [])
    min_price = None
    if isinstance(saletype_list, list):
        prices = []
        for saletype in saletype_list:
            price_str = saletype.get('data', {}).get('price')
            if price_str:
                try:
                    prices.append(int(price_str))
                except (ValueError, TypeError):
                    pass
        if prices:
            min_price = min(prices)
    
    # アフィリエイトURL
    affiliate_url = data.get('affiliateurl') or ""
    
    # 画像URLリスト (サムネイルとジャケット画像を収集)
    # DUGAデータ例: "jacketimage": [{"large": "..."}], "thumbnail": [{"image": "..."}]
    image_url_list = []
    
    jacket_images = data.get('jacketimage', [])
    if isinstance(jacket_images, list) and jacket_images:
        # 大サイズのジャケット画像を優先
        large_jacket = jacket_images[0].get('large') if isinstance(jacket_images[0], dict) else None
        if large_jacket:
            image_url_list.append(large_jacket)
    
    # サムネイル画像（スクショ）を追加
    thumbnails = data.get('thumbnail', [])
    if isinstance(thumbnails, list):
        # 最大2枚のスクショを追加
        for item in thumbnails[:2]:
            if item.get('image'):
                image_url_list.append(item['image'])
    
    if not image_url_list:
        image_url_json = "[]"
    else:
        # JSONFieldに保存するためJSON文字列に変換
        image_url_json = json.dumps(image_url_list)
        
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
        'image_url_list': image_url_json, # JSON文字列
        'maker_id': maker_id,
        'label_id': label_id,
        'series_id': series_id, 
        'director_id': director_id,
        'raw_data_id': raw_data_instance.id, # RawApiDataのID
        'updated_at': datetime.now(),
        'is_active': True,
    }
    
    # リレーションシップ用のデータ辞書
    relations_data = {
        'genre_ids': genre_ids,
        'actress_ids': actress_ids,
    }

    # コマンド側の期待する形式に合わせてリストとして返す
    return [product_data], [relations_data]