# api/utils.py (データパース堅牢化修正版)
import json # ★ JSONデコードのために必要
from django.db import transaction
from django.db.models import Model
from django.utils.dateparse import parse_date
import hashlib

from api.models import RawApiData, Product, Maker, Label, Genre, Actress, Director 


# --------------------------------------------------------------------------
# 1. RawApiDataの一括挿入・更新
# --------------------------------------------------------------------------

def bulk_insert_or_update(model_name: str, batch: list):
    """
    指定されたモデルに対して、一括で挿入または更新を行います。
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
    with transaction.atomic():
        Model.objects.bulk_create(
            [Model(**data) for data in batch],
            update_conflicts=True,
            unique_fields=unique_fields,
            update_fields=update_fields,
        )


# --------------------------------------------------------------------------
# 2. エンティティの取得または作成
# --------------------------------------------------------------------------

def get_or_create_entity(model: type[Model], api_source: str, name: str, api_id: str | None = None) -> int | None:
    """
    エンティティ（Maker, Genreなど）を取得または作成し、そのプライマリキー（ID）を返す。
    
    ★修正: get_or_createを独立したトランザクションで囲み、メイン処理のトランザクション破壊を防ぐ。
    """
    if not name:
        return None
    
    # ジャンルはAPI IDがない場合、名前のハッシュ値を api_id として使用する
    if model is Genre and api_id is None:
        # nameのMD5ハッシュ値を使用
        api_id_to_use = hashlib.md5(name.encode('utf-8')).hexdigest()
    else:
        api_id_to_use = api_id
        
    try:
        # ★ 修正箇所: ここで独立したトランザクションを開始
        with transaction.atomic():
            # Djangoの get_or_create を使用
            entity, created = model.objects.get_or_create(
                api_source=api_source,
                name=name,
                defaults={
                    'api_id': api_id_to_use,
                }
            )
            return entity.id
            
    except Exception as e:
        # 競合やその他の予期せぬエラーが発生した場合
        # このエラーは、この小さな atomic ブロック内で捕捉され、ロールバックされる。
        # メインの normalize_duga コマンドのトランザクションは壊れない。
        print(f"[{model.__name__}] エンティティの取得/作成中にエラーが発生: {e}")
        return None


# --------------------------------------------------------------------------
# 3. DUGA API データを Product モデル形式に正規化するヘルパー関数
# --------------------------------------------------------------------------

def normalize_duga_data(raw_data_instance: RawApiData) -> dict:
    """
    RawApiDataインスタンス (DUGA) のJSONデータから、Productおよびリレーション情報を含む
    辞書を構築する。
    """
    # JSON文字列のデコード処理 (前回の修正)
    raw_data = raw_data_instance.raw_json_data
    try:
        # raw_json_dataが文字列の場合、json.loads()で辞書に変換する
        if isinstance(raw_data, str):
            data = json.loads(raw_data)
        else:
            # 既に辞書型の場合はそのまま使用 (JSONFieldを使っている場合など)
            data = raw_data
            
    except json.JSONDecodeError as e:
        # JSONフォーマットが不正な場合は、ValueErrorを発生させて処理を中断
        raise ValueError(f"JSONパースエラー: {e}") 

    # ------------------
    # 1. データの抽出と整形
    # ------------------
    
    # ① ユニークID: APIソース + 作品ID (必須)
    api_product_id = data.get('productid')
    if not api_product_id:
        raise ValueError("DUGAデータに productid がありません。")
        
    product_id_unique = f"DUGA-{api_product_id}"
    
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
        maker_id = get_or_create_entity(Maker, 'DUGA', maker_name)

    # ジャンル (Genre) - DUGAは 'category' フィールドを使用 (堅牢化されたロジック)
    genre_info = data.get('category')
    if (isinstance(genre_info, list) and genre_info and 
        isinstance(genre_info[0], dict)):
        
        # 'data' キーが存在するかどうかで分岐
        if 'data' in genre_info[0] and isinstance(genre_info[0]['data'], dict):
            # 通常の構造: {'data': {'name': 'X'}}
            genre_data = genre_info[0]['data']
        else:
            # 簡略構造: {'name': 'X'} または予期せぬ構造
            genre_data = genre_info[0]
            
        genre_name = genre_data.get('name')
        
        if genre_name and isinstance(genre_name, str):
            genre_id = get_or_create_entity(Genre, 'DUGA', genre_name)
            if genre_id:
                genre_ids.append(genre_id)
                
    # 出演者 (Actress) - DUGAは 'performer_name' フィールドを使用
    performer_str = data.get('performer_name')
    if performer_str and isinstance(performer_str, str): # 文字列であることを確認
        performer_names = [p.strip() for p in performer_str.split(',') if p.strip()]
        for name in performer_names:
            actress_id = get_or_create_entity(Actress, 'DUGA', name)
            if actress_id:
                actress_ids.append(actress_id)

    # ------------------
    # 3. Product インスタンス構築用データの返却
    # ------------------
    
    product_data = {
        'raw_data': raw_data_instance, # Productモデルとのリレーション用
        'api_source': 'DUGA',
        'product_id_unique': product_id_unique,
        'title': title,
        'release_date': release_date,
        'affiliate_url': data.get('affiliateurl') or data.get('url', 'http://error.url'),
        'price': price,
        'image_url_list': image_url_list,
        'maker_id': maker_id, # ForeignKeyはIDで直接設定
        'label_id': label_id,
        'director_id': director_id,
    }
    
    relations_data = {
        'genre_ids': genre_ids,
        'actress_ids': actress_ids,
    }
    
    return {'product_data': product_data, 'relations': relations_data}