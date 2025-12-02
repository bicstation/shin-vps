import json
from datetime import datetime
from django.db import transaction, IntegrityError
from django.db.models import Model
from django.utils.dateparse import parse_date
import hashlib
import unicodedata

# 仮定されているモデルと定数のインポート
from api.models import RawApiData, Product, Maker, Label, Genre, Actress, Director, Series
# constantsはコードに含まれていないため、インポート名が合っているか確認してください
# from api.constants import generate_product_unique_id 

# ロガーのセットアップ (デバッグログ用)
import logging
logger = logging.getLogger('api_utils')
logger.setLevel(logging.DEBUG) 

# --- (generate_product_unique_id が定義されていないため、仮の定義を追加) ---
# プロジェクト内の actual api.constants の定義に置き換えてください
def generate_product_unique_id(api_source: str, api_product_id: str) -> str:
    """APIソースと商品IDからユニークIDを生成する仮関数"""
    return f"{api_source}-{api_product_id}"
# --------------------------------------------------------------------------

# --------------------------------------------------------------------------
# 1. RawApiDataの一括挿入・更新
# --------------------------------------------------------------------------

def bulk_insert_or_update(model_name: str, batch: list):
    """
    指定されたモデルに対して、一括で挿入または更新を行います。（RawApiDataモデル専用）
    """
    if not batch:
        return

    # RawApiDataモデルを使用
    Model = RawApiData
    
    # 既存のレコードを更新するためのフィールド
    update_fields = ['raw_json_data', 'api_service', 'api_floor', 'updated_at']
    # 一意性を判定するためのフィールド
    unique_fields = ['api_source', 'api_product_id'] 

    # データベースへの一括挿入/更新を実行
    try:
        with transaction.atomic():
            Model.objects.bulk_create(
                [Model(**data) for data in batch],
                update_conflicts=True,
                unique_fields=unique_fields,
                update_fields=update_fields,
            )
    except Exception as e:
        logger.error(f"RawApiDataのbulk_create/update中にエラーが発生: {e}")


# --------------------------------------------------------------------------
# 2. エンティティの取得または作成
# --------------------------------------------------------------------------

def get_or_create_entity(model: type[Model], api_source: str, name: str, api_id: str | None = None) -> int | None:
    """
    エンティティ（Maker, Genreなど）を取得または作成し、そのプライマリキー（ID）を返す。
    
    独立した atomic ブロック内で get_or_create を実行し、
    IntegrityError が発生した場合は完全に捕捉し、Noneを返してトランザクション破壊を防ぐ。
    """
    if not name or not api_source:
        return None
    
    # ジャンルはAPI IDがない場合、名前のMD5ハッシュ値を使用 (一意性の確保)
    api_id_to_use = api_id
    if model is Genre and api_id is None:
        # nameのMD5ハッシュ値を使用
        api_id_to_use = hashlib.md5(name.encode('utf-8')).hexdigest()
        
    try:
        # 独立したトランザクションを開始 
        with transaction.atomic():
            # Djangoの get_or_create を使用
            entity, created = model.objects.get_or_create(
                api_source=api_source,
                name=name,
                defaults={
                    'api_id': api_id_to_use,
                }
            )
            # 作成された場合、ログ出力
            if created:
                logger.info(f"[{api_source}:{model.__name__}] 新規エンティティを作成: {name}")
                
            return entity.id
            
    except IntegrityError:
        # IntegrityError（ユニーク制約違反など）が発生した場合
        logger.warning(f"[{api_source}:{model.__name__}] Integrity Errorが発生 (名前: {name})。Noneを返します。")
        return None
        
    except Exception as e:
        # その他の予期せぬエラー
        logger.error(f"[{api_source}:{model.__name__}] エンティティの取得/作成中にエラーが発生: {e}")
        return None


# --------------------------------------------------------------------------
# 3. DUGA API データを Product モデル形式に正規化するヘルパー関数
# --------------------------------------------------------------------------

def normalize_duga_data(raw_data_instance: RawApiData) -> tuple[list[dict], list[dict]]:
    """
    RawApiDataインスタンス (DUGA) のJSONデータから、Productデータ辞書とリレーション情報を含む
    辞書を構築する。FANZAの normalize_fanza_data と戻り値の形式を合わせる。
    """
    # JSON文字列のデコード処理
    raw_data = raw_data_instance.raw_json_data
    try:
        if isinstance(raw_data, str):
            data = json.loads(raw_data)
        else:
            data = raw_data
            
    except json.JSONDecodeError as e:
        logger.error(f"Raw ID {raw_data_instance.id} の DUGA JSONパースエラー: {e}") 
        return [], []
    except Exception as e:
        logger.error(f"Raw ID {raw_data_instance.id} の DUGA データ処理で予期せぬエラー: {e}") 
        return [], []

    # ------------------
    # 1. データの抽出と整形
    # ------------------
    
    # ① ユニークID: APIソース + 作品ID (必須)
    api_product_id = data.get('productid')
    if not api_product_id:
        logger.warning(f"Raw ID {raw_data_instance.id} のDUGAデータに productid がありません。スキップします。")
        return [], []
        
    product_id_unique = generate_product_unique_id('DUGA', api_product_id)
    
    # ② リリース日: YYYY-MM-DD 形式にパース
    release_date_str = data.get('date', '').replace('/', '-')
    release_date = parse_date(release_date_str)
    
    # ③ 画像URLリスト: 画像がある場合のみリストに格納 (堅牢化されたロジック)
    image_url_list = []
    main_image_url_raw = data.get('image_url') or data.get('posterimage') or data.get('jacketimage')
    main_image_url = None
    
    if isinstance(main_image_url_raw, list) and main_image_url_raw:
        image_entry = main_image_url_raw[0]
        if isinstance(image_entry, dict):
             # 辞書の場合、'image' または 'large' キーを試す
             main_image_url = image_entry.get('image') or image_entry.get('large')
        elif isinstance(image_entry, str):
             # リスト内に直接URL文字列が入っている場合
             main_image_url = image_entry
    elif isinstance(main_image_url_raw, str):
        # 単一のURL文字列の場合
        main_image_url = main_image_url_raw
    
    if main_image_url and isinstance(main_image_url, str):
        image_url_list.append(main_image_url)


    # ④ 価格: 'price' フィールドを整数で取得
    raw_price = data.get('price')
    price = None
    if raw_price:
        # 数字とハイフン以外の文字を削除
        cleaned_price = "".join(filter(str.isdigit, str(raw_price)))
        try:
            price = int(cleaned_price)
        except ValueError:
            price = None
        
    # ⑤ タイトル: 'title' フィールド (必須)
    title = data.get('title', 'タイトル不明')
    
    # ------------------
    # 2. エンティティの取得/作成（リレーション構築）
    # ------------------
    
    maker_id = None
    label_id = None
    director_id = None
    genre_ids = []
    actress_ids = []

    # メーカー (Maker)
    maker_name = data.get('makername')
    if maker_name:
        # DUGAはメーカーのAPI IDを持たないため、api_id=Noneを渡す
        maker_id = get_or_create_entity(Maker, 'DUGA', maker_name)

    # ジャンル (Genre) - DUGAは 'category' フィールドを使用
    genre_info = data.get('category')
    
    # DUGAの category は複雑なリスト構造の可能性があるため、ロジックを簡素化し、名前を取得
    genre_names = []
    if isinstance(genre_info, list) and genre_info:
        for item in genre_info:
            if isinstance(item, dict):
                # 'data' キーの中か、辞書直下から name を探す
                name = item.get('data', {}).get('name') or item.get('name')
                if name and isinstance(name, str):
                    genre_names.append(name)
                    
    for name in genre_names:
        # DUGAはAPI IDを持たないため、api_id=Noneを渡す (get_or_create_entity内でハッシュ化される)
        genre_id = get_or_create_entity(Genre, 'DUGA', name) 
        if genre_id:
            genre_ids.append(genre_id)
            
    # 出演者 (Actress) - DUGAは 'performer_name' フィールドを使用
    performer_str = data.get('performer_name')
    if performer_str and isinstance(performer_str, str): # 文字列であることを確認
        performer_names = [p.strip() for p in performer_str.split(',') if p.strip()]
        for name in performer_names:
            # DUGAはAPI IDを持たないため、api_id=Noneを渡す
            actress_id = get_or_create_entity(Actress, 'DUGA', name)
            if actress_id:
                actress_ids.append(actress_id)

    # ------------------
    # 3. Product インスタンス構築用データの返却
    # ------------------
    
    # 画像URL (JSONFieldに対応するため文字列化)
    # image_url_list が空リストの場合でも、NOT NULL制約のため空のJSON配列を表す文字列 '[]' にする
    if not image_url_list:
        image_url_json = "[]"
    else:
        # JSONFieldに保存するためにJSON文字列に変換
        image_url_json = json.dumps(image_url_list) 
        
    product_data = {
        'raw_data_id': raw_data_instance.id, 
        'api_source': 'DUGA',
        'product_id_unique': product_id_unique,
        'title': title,
        'release_date': release_date,
        'affiliate_url': data.get('affiliateurl') or data.get('url') or "", # affiliate_urlがnullの場合空文字列
        'price': price,
        'image_url_list': image_url_json, # 修正後の変数を使用
        'maker_id': maker_id, 
        'label_id': label_id,
        'director_id': director_id,
        'updated_at': datetime.now(), 
    }
    
    relations_data = {
        'api_product_id': api_product_id, # リレーション同期のためにIDは保持
        'genre_ids': genre_ids,
        'actress_ids': actress_ids,
    }
    
    # normalize_fanza_data と戻り値の形式を合わせるためリストでラップ
    return [product_data], [relations_data] 


# --------------------------------------------------------------------------
# 4. FANZA API データを Product モデル形式に正規化するヘルパー関数
# --------------------------------------------------------------------------

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
        data = data[0] # リストの最初の要素を使用

    if isinstance(data, dict):
        # nameとidを抽出
        return data.get('name'), data.get('id')
    elif isinstance(data, str):
        # 名前だけが文字列として渡されるケースに対応
        return data, None

    return None, None

def normalize_fanza_data(raw_instance: RawApiData) -> tuple[list[dict], list[dict]]:
    """
    RawApiData (FANZA: 1バッチ) のレコードを読み込み、Productモデルとリレーションに必要なデータに正規化する。
    1つのRawApiDataから複数の製品データ（リスト）を返す。
    """
    
    raw_data = raw_instance.raw_json_data
    data = {} 
    try:
        if isinstance(raw_data, str):
            data = json.loads(raw_data)
        else:
            data = raw_data
    except json.JSONDecodeError:
        logger.error(f"Raw ID {raw_instance.id} の FANZA JSONデコードエラー。スキップします。")
        return [], []

    logger.debug(f"DEBUG: Raw ID {raw_instance.id} - トップレベルのキー: {list(data.keys()) if isinstance(data, dict) else 'Not Dict'}")
    item_list = data.get('result', {}).get('items', [])
    logger.debug(f"DEBUG: Raw ID {raw_instance.id} - 'result' の有無: {'result' in data}")
    if 'result' in data and isinstance(data['result'], dict):
        result_keys = list(data['result'].keys())
        logger.debug(f"DEBUG: Raw ID {raw_instance.id} - 'result' 内のキー: {result_keys}")
    logger.debug(f"DEBUG: Raw ID {raw_instance.id} - item_list 抽出件数: {len(item_list)}")
    
    products_data_list = []
    relations_list = []

    if not item_list:
        return [], []
    
    for item_info in item_list:
        api_raw_id = None
        try:
            api_raw_id = item_info.get('content_id') 
            
            if not api_raw_id:
                api_raw_id = item_info.get('product_id') or item_info.get('id')
                
            if not api_raw_id:
                logger.warning(f"Raw ID {raw_instance.id} 内のアイテムに ID がありません。スキップします。")
                continue

            # --------------------------------------------------------------------------------
            # A. エンティティの抽出 (FKに必要な名前とAPI IDの取得)
            # --------------------------------------------------------------------------------
            item_info_content = item_info.get('iteminfo', {})
            
            # Maker
            maker_name, maker_api_id = _safe_extract_single_entity(item_info_content, 'maker')
            maker_id = get_or_create_entity(Maker, 'FANZA', maker_name, maker_api_id)

            # Label
            label_name, label_api_id = _safe_extract_single_entity(item_info_content, 'label')
            label_id = get_or_create_entity(Label, 'FANZA', label_name, label_api_id)

            # Series
            series_name, series_api_id = _safe_extract_single_entity(item_info_content, 'series')
            series_id = get_or_create_entity(Series, 'FANZA', series_name, series_api_id)

            # Director
            director_name, director_api_id = _safe_extract_single_entity(item_info_content, 'director')
            director_id = get_or_create_entity(Director, 'FANZA', director_name, director_api_id)

            # --------------------------------------------------------------------------------
            # B. Product データ構築 (モデル定義に合うフィールドのみに絞り込み)
            # --------------------------------------------------------------------------------
            
            product_id_unique = generate_product_unique_id('FANZA', api_raw_id)
            
            # 価格情報の整形
            raw_price = item_info.get('price')
            price = None
            try:
                price = int(raw_price) if raw_price else None
            except (ValueError, TypeError):
                pass 

            # サンプル画像URLリストの構築
            sample_image_urls = item_info.get('sample_image_urls')
            image_url_list = []
            if isinstance(sample_image_urls, dict):
                image_url_list.extend(sample_image_urls.get('sample', []))
            
            # ★★★ 画像URLのNOT NULL制約対策 ★★★
            # image_url_listが空リストの場合、JSON文字列 '[]' を設定する
            if not image_url_list:
                 image_url_json = "[]"
            else:
                 image_url_json = json.dumps(image_url_list)
            # --------------------------------
            
            # ★★★ affiliate_urlがNoneの場合、空文字列を設定 ★★★
            affiliate_url = item_info.get('affiliate_url')
            
            product_data = {
                # リレーションフィールド (IDで設定)
                'raw_data_id': raw_instance.id, 
                'maker_id': maker_id,
                'label_id': label_id,
                'series_id': series_id,
                'director_id': director_id,

                # 必須/主要フィールド
                'api_source': 'FANZA',
                'product_id_unique': product_id_unique,
                'title': item_info.get('title'),
                'affiliate_url': affiliate_url if affiliate_url is not None else "", # None対策
                'price': price,
                'release_date': parse_date(item_info.get('date') or item_info.get('release_date')), 
                
                # 画像URL (JSONFieldに対応するため文字列化)
                'image_url_list': image_url_json, # 修正後の変数を使用
                
                # 追跡用フィールド (UPSERT時に更新)
                'updated_at': datetime.now(), 
                'created_at': datetime.now(), 
            }

            # --------------------------------------------------------------------------------
            # C. リレーションデータ構築 (Actress, GenreのIDを取得)
            # --------------------------------------------------------------------------------
            
            actress_ids = []
            genre_ids = []
            
            # 女優
            actress_info = item_info_content.get('actress')
            if isinstance(actress_info, list):
                for a in actress_info:
                    if isinstance(a, dict) and 'name' in a:
                        actress_name = a['name']
                        actress_api_id = a.get('id')
                        actress_id = get_or_create_entity(Actress, 'FANZA', actress_name, actress_api_id)
                        if actress_id:
                            actress_ids.append(actress_id)
            
            # ジャンル
            genre_info = item_info_content.get('genre')
            if isinstance(genre_info, list):
                for g in genre_info:
                    if isinstance(g, dict) and 'name' in g:
                        genre_name = g['name']
                        genre_api_id = g.get('id')
                        genre_id = get_or_create_entity(Genre, 'FANZA', genre_name, genre_api_id) 
                        if genre_id:
                            genre_ids.append(genre_id)


            relations = {
                'api_product_id': api_raw_id, # リレーション同期のためにIDは保持
                'genre_ids': genre_ids,
                'actress_ids': actress_ids,
            }

            products_data_list.append(product_data)
            relations_list.append(relations)
            
        except Exception as e:
            logger.error(f"Raw ID {raw_instance.id} 内のアイテム ID {api_raw_id} の処理中にエラー: {e}")
            continue
            
    return products_data_list, relations_list