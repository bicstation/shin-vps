# api/utils/common.py

import json
import re
import hashlib
import logging
from datetime import datetime
from django.db import transaction, IntegrityError
from django.db.models import Model
from django.utils.dateparse import parse_date

# ロガーのセットアップ
logger = logging.getLogger('api_utils')
logger.setLevel(logging.DEBUG) 

# --------------------------------------------------------------------------
# 1. 共通ユーティリティ (ID生成など)
# --------------------------------------------------------------------------

def generate_product_unique_id(api_source: str, api_product_id: str) -> str:
    """APIソースと商品IDからユニークIDを生成する"""
    # FANZA_ssis-123 や DUGA_0100dg-001 の形式
    return f"{api_source}_{api_product_id}"

# --------------------------------------------------------------------------
# 2. エンティティの取得または作成 (共通)
# --------------------------------------------------------------------------

def get_or_create_entity(model: type[Model], api_source: str, name: str, api_id: str | None = None) -> int | None:
    """エンティティ（Maker, Genreなど）を取得または作成し、そのプライマリキー（ID）を返す"""
    if not name or not api_source:
        return None
    
    # ジャンルはAPI IDがない場合、名前のMD5ハッシュ値を使用 (一意性の確保)
    api_id_to_use = api_id
    from api.models import Genre # 循環参照を避けるため関数内でインポート
    if model is Genre and api_id is None:
        api_id_to_use = hashlib.md5(name.encode('utf-8')).hexdigest()
        
    try:
        with transaction.atomic():
            entity, created = model.objects.get_or_create(
                api_source=api_source,
                name=name,
                defaults={'api_id': api_id_to_use}
            )
            if created:
                logger.info(f"[{api_source}:{model.__name__}] 新規作成: {name}")
            return entity.id
    except Exception as e:
        logger.error(f"[{api_source}:{model.__name__}] get_or_createエラー: {e}")
        return None

# --------------------------------------------------------------------------
# 3. PC製品データを正規化するヘルパー関数
# --------------------------------------------------------------------------

def normalize_pc_data(row: dict, site_prefix: str = 'acer') -> dict:
    """CSVの1行分をPCProductモデルの形式に正規化する"""
    image_url = row.get('image_url', '')
    
    # JANコード抽出 (JAN-13桁 または 45/49開始の13桁)
    jan_match = re.search(r'JAN-(\d{13})', image_url)
    if not jan_match:
        jan_match = re.search(r'(4[59]\d{11})', image_url)

    if jan_match:
        u_id = jan_match.group(1)
    else:
        # JANがない場合はURLの末尾をIDにする
        u_id = row.get('url', '').strip('/').split('/')[-1]

    raw_price = row.get('price', '0')
    clean_price = int(''.join(filter(str.isdigit, str(raw_price)))) if raw_price else 0

    return {
        'unique_id': u_id,
        'site_prefix': site_prefix,
        'maker': 'Acer' if site_prefix == 'acer' else row.get('maker', 'Unknown'),
        'name': row.get('name', 'No Name'),
        'price': clean_price,
        'url': row.get('url', ''),
        'image_url': image_url,
        'description': row.get('description', ''),
        'genre': 'laptop',
        'is_active': True,
        'updated_at': datetime.now(),
    }

# --------------------------------------------------------------------------
# 4. DUGA API データを正規化するヘルパー関数
# --------------------------------------------------------------------------

def normalize_duga_data(raw_data_instance) -> tuple[list[dict], list[dict]]:
    """RawApiData (DUGA) のJSONからProductデータとリレーションを構築"""
    raw_data = raw_data_instance.raw_json_data
    try:
        data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
    except Exception as e:
        logger.error(f"DUGAパースエラー: {e}") 
        return [], []

    api_product_id = data.get('productid')
    if not api_product_id: return [], []
        
    product_id_unique = generate_product_unique_id('DUGA', api_product_id)
    release_date = parse_date(data.get('date', '').replace('/', '-'))
    
    # 画像URL処理 (堅牢化)
    image_url_list = []
    main_image_raw = data.get('image_url') or data.get('posterimage') or data.get('jacketimage')
    if isinstance(main_image_raw, list) and main_image_raw:
        item = main_image_raw[0]
        url = item.get('image') or item.get('large') if isinstance(item, dict) else item
        if url: image_url_list.append(url)
    elif isinstance(main_image_raw, str):
        image_url_list.append(main_image_raw)

    from api.models import Maker, Genre, Actress # 遅延インポート
    maker_id = get_or_create_entity(Maker, 'DUGA', data.get('makername'))
    
    genre_ids = []
    for item in (data.get('category') or []):
        if isinstance(item, dict):
            name = item.get('data', {}).get('name') or item.get('name')
            gid = get_or_create_entity(Genre, 'DUGA', name)
            if gid: genre_ids.append(gid)
            
    actress_ids = []
    performer_str = data.get('performer_name')
    if performer_str and isinstance(performer_str, str):
        for name in [p.strip() for p in performer_str.split(',') if p.strip()]:
            aid = get_or_create_entity(Actress, 'DUGA', name)
            if aid: actress_ids.append(aid)

    product_data = {
        'raw_data_id': raw_data_instance.id, 
        'api_source': 'DUGA',
        'product_id_unique': product_id_unique,
        'title': data.get('title', 'タイトル不明'),
        'release_date': release_date,
        'affiliate_url': data.get('affiliateurl') or data.get('url') or "",
        'price': int("".join(filter(str.isdigit, str(data.get('price'))))) if data.get('price') else None,
        'image_url_list': json.dumps(image_url_list),
        'maker_id': maker_id, 
        'updated_at': datetime.now(), 
    }
    
    return [product_data], [{'api_product_id': api_product_id, 'genre_ids': genre_ids, 'actress_ids': actress_ids}]

# --------------------------------------------------------------------------
# 5. FANZA API データを正規化するヘルパー関数
# --------------------------------------------------------------------------

def _safe_extract_single_entity(item_info_content: dict, key: str) -> tuple[str | None, str | None]:
    """FANZAのメーカー、レーベルなどの抽出補助"""
    data = item_info_content.get(key)
    if not data: return None, None
    if isinstance(data, list) and data: data = data[0]
    if isinstance(data, dict): return data.get('name'), data.get('id')
    return (data, None) if isinstance(data, str) else (None, None)

def normalize_fanza_data(raw_instance) -> tuple[list[dict], list[dict]]:
    """RawApiData (FANZA) の正規化"""
    raw_data = raw_instance.raw_json_data
    try:
        data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
    except Exception: return [], []

    from api.models import Maker, Label, Series, Director, Actress, Genre # 遅延インポート
    item_list = data.get('result', {}).get('items', [])
    p_list, r_list = [], []

    for item in item_list:
        cid = item.get('content_id') or item.get('product_id') or item.get('id')
        if not cid: continue

        info = item.get('iteminfo', {})
        m_name, m_aid = _safe_extract_single_entity(info, 'maker')
        l_name, l_aid = _safe_extract_single_entity(info, 'label')
        s_name, s_aid = _safe_extract_single_entity(info, 'series')
        d_name, d_aid = _safe_extract_single_entity(info, 'director')

        # サンプル画像URL
        s_imgs = item.get('sample_image_urls', {})
        img_list = s_imgs.get('sample', []) if isinstance(s_imgs, dict) else []

        product_data = {
            'raw_data_id': raw_instance.id, 
            'maker_id': get_or_create_entity(Maker, 'FANZA', m_name, m_aid),
            'label_id': get_or_create_entity(Label, 'FANZA', l_name, l_aid),
            'series_id': get_or_create_entity(Series, 'FANZA', s_name, s_aid),
            'director_id': get_or_create_entity(Director, 'FANZA', d_name, d_aid),
            'api_source': 'FANZA',
            'product_id_unique': generate_product_unique_id('FANZA', cid),
            'title': item.get('title'),
            'affiliate_url': item.get('affiliate_url') or "",
            'price': int(item.get('price')) if item.get('price') else None,
            'release_date': parse_date(item.get('date') or item.get('release_date')), 
            'image_url_list': json.dumps(img_list),
            'updated_at': datetime.now(), 
            'created_at': datetime.now(), 
        }

        # リレーションデータ
        act_ids = [get_or_create_entity(Actress, 'FANZA', a['name'], a.get('id')) for a in info.get('actress', []) if isinstance(a, dict) and 'name' in a]
        gen_ids = [get_or_create_entity(Genre, 'FANZA', g['name'], g.get('id')) for g in info.get('genre', []) if isinstance(g, dict) and 'name' in g]

        p_list.append(product_data)
        r_list.append({'api_product_id': cid, 'genre_ids': [i for i in gen_ids if i], 'actress_ids': [i for i in act_ids if i]})
            
    return p_list, r_list