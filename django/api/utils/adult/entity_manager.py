import hashlib
import logging
from typing import Optional, List, Dict, Type
from django.db import transaction, IntegrityError
from django.db.models import Model
from django.core.exceptions import ObjectDoesNotExist

# ログ設定
logger = logging.getLogger('api_utils')

def get_or_create_entity(model: Type[Model], names: List[str], api_source: str) -> Dict[str, int]:
    """
    エンティティ名リストを受け取り、一括でget_or_createを実行し、{name: pk} のマップを返す。
    Genre, Actress, Maker, Series だけでなく、新設の AdultAttribute 等にも対応。
    """
    
    if not names:
        return {}
        
    # 重複を除去し、整形（空文字やNoneを除外）
    unique_names = list(set(name.strip() for name in names if name and isinstance(name, str) and name.strip()))
    if not unique_names:
        return {}

    pk_map: Dict[str, int] = {}
    
    # 1. 既存のレコードを一括で取得（api_sourceがあるモデルを想定）
    # ※ AdultAttribute等、api_sourceを持たないモデルの場合はフィルタリングを調整
    query_params = {'name__in': unique_names}
    if hasattr(model, 'api_source'):
        query_params['api_source'] = api_source

    existing_entities = model.objects.filter(**query_params).values('pk', 'name')
    for entity in existing_entities:
        pk_map[entity['name']] = entity['pk']

    # 新規作成が必要な名前を特定
    existing_names = set(pk_map.keys())
    names_to_create = [name for name in unique_names if name not in existing_names]
    
    if not names_to_create:
        return pk_map

    # 2. 新規インスタンスを準備
    new_entities = []
    for name in names_to_create:
        fields = {
            'name': name,
        }
        
        # モデルごとの特殊フィールド処理
        if hasattr(model, 'api_source'):
            fields['api_source'] = api_source
            
        if hasattr(model, 'api_id') or model.__name__ == 'Genre':
            # Genreや一部エンティティに必要な一意識別ハッシュ
            fields['api_id'] = hashlib.md5(name.encode('utf-8')).hexdigest()
            
        if hasattr(model, 'product_count'):
            fields['product_count'] = 0

        # AdultAttribute の場合は slug が必須なため生成（簡易版）
        if model.__name__ == 'AdultAttribute' and hasattr(model, 'slug'):
            fields['slug'] = f"attr-{hashlib.md5(name.encode('utf-8')).hexdigest()[:8]}"

        new_entities.append(model(**fields))

    # 3. 一括作成 (bulk_create)
    try:
        with transaction.atomic():
            model.objects.bulk_create(new_entities, ignore_conflicts=True) # 競合は無視して安全に作成
            
        # 作成された（あるいは既に存在した）エンティティをデータベースから再度取得してpk_mapを完成させる
        newly_created_entities = model.objects.filter(**query_params).values('pk', 'name')
        
        for entity in newly_created_entities:
            pk_map[entity['name']] = entity['pk']
            
        logger.info(f"[{api_source}] {model.__name__}: 処理完了 (新規作成含む合計: {len(pk_map)} 件)")
        
    except Exception as e:
        logger.error(f"[{api_source}] {model.__name__} の一括作成中にエラー: {e}")
        # 失敗した場合は既存のマップだけでも返す
        pass 

    return pk_map