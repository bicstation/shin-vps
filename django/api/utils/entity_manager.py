import hashlib
import logging
from typing import Optional, List, Dict, Type
from django.db import transaction, IntegrityError
from django.db.models import Model
from django.core.exceptions import ObjectDoesNotExist

# ログ設定
logger = logging.getLogger('api_utils')

# ここに自己参照インポート（from .entity_manager import ...）が無いことを確認してください。

def get_or_create_entity(model: Type[Model], names: List[str], api_source: str) -> Dict[str, int]:
    """
    エンティティ名リストを受け取り、一括でget_or_createを実行し、{name: pk} のマップを返す。
    （中略：実際のget_or_createロジックがここにある）
    """
    
    if not names:
        return {}
        
    # 重複を除去し、整形
    unique_names = list(set(name.strip() for name in names if name.strip()))
    if not unique_names:
        return {}

    pk_map: Dict[str, int] = {}
    
    # 1. 既存のレコードを一括で取得
    existing_entities = model.objects.filter(name__in=unique_names, api_source=api_source).values('pk', 'name')
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
        api_id_to_use = None
        if model.__name__ == 'Genre':
            api_id_to_use = hashlib.md5(name.encode('utf-8')).hexdigest()
            
        new_entities.append(
            model(
                name=name, 
                api_source=api_source, 
                api_id=api_id_to_use, 
                product_count=0
            )
        )

    # 3. 一括作成 (bulk_create)
    try:
        with transaction.atomic():
            model.objects.bulk_create(new_entities)
            
        # 作成されたエンティティをデータベースから再度取得
        newly_created_entities = model.objects.filter(
            name__in=names_to_create, 
            api_source=api_source
        ).values('pk', 'name')
        
        for entity in newly_created_entities:
            pk_map[entity['name']] = entity['pk']
            
        logger.info(f"[{api_source}] {model.__name__}: 新規 {len(names_to_create)} 件を作成しました。")
        
    except Exception as e:
        logger.error(f"[{api_source}] {model.__name__} の一括作成中にエラー: {e}")
        pass 

    return pk_map

# --------------------------------------------------------------------------
# 注意: このファイルには normalize_duga_data 関数は含めないでください。
# --------------------------------------------------------------------------