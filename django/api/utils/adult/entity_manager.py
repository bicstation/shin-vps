# /home/maya/dev/shin-vps/django/api/utils/adult/entity_manager.py
# -*- coding: utf-8 -*-
import hashlib
import logging
from typing import List, Dict, Type, Any
from django.db import transaction
from django.db.models import Model

logger = logging.getLogger('api_utils')

def get_or_create_entity(model: Type[Model], names: List[str], api_source: str) -> Dict[str, int]:
    """
    エンティティ名リストを一括で取得・作成し、{name: pk} のマップを返す。
    ハッシュ生成、スラグ対応、ブランド分離を完全にサポート。
    """
    if not names:
        return {}
        
    unique_names = list(set(name.strip() for name in names if name and isinstance(name, str) and name.strip()))
    if not unique_names:
        return {}

    pk_map: Dict[str, int] = {}
    query_params: Dict[str, Any] = {'name__in': unique_names}
    if hasattr(model, 'api_source'):
        query_params['api_source'] = api_source

    # 1. 既存チェック
    existing_entities = model.objects.filter(**query_params).values('pk', 'name')
    for entity in existing_entities:
        pk_map[entity['name']] = entity['pk']

    names_to_create = [name for name in unique_names if name not in pk_map]
    if not names_to_create:
        return pk_map

    # 2. 新規準備
    new_entities = []
    for name in names_to_create:
        fields = {'name': name}
        
        # slug処理: AdultAttributeはhash、他は名前をそのまま使用
        if hasattr(model, 'slug'):
            if model.__name__ == 'AdultAttribute':
                fields['slug'] = f"attr-{hashlib.md5(name.encode('utf-8')).hexdigest()[:12]}"
            else:
                fields['slug'] = name
            
        if hasattr(model, 'api_source'):
            fields['api_source'] = api_source
            
        # Genreや一部エンティティに必要なmd5ハッシュ
        if hasattr(model, 'api_id') or model.__name__ == 'Genre':
            fields['api_id'] = hashlib.md5(name.encode('utf-8')).hexdigest()
            
        if hasattr(model, 'product_count'):
            fields['product_count'] = 0

        new_entities.append(model(**fields))

    # 3. bulk_create
    try:
        if new_entities:
            with transaction.atomic():
                model.objects.bulk_create(new_entities, ignore_conflicts=True)
            
            # 作成後再取得
            final_entities = model.objects.filter(**query_params).values('pk', 'name')
            for entity in final_entities:
                pk_map[entity['name']] = entity['pk']
                
        logger.info(f"[{api_source}] {model.__name__}: 同期完了 (合計: {len(pk_map)} 件)")
    except Exception as e:
        logger.error(f"[{api_source}] {model.__name__} 同期エラー: {e}")

    return pk_map