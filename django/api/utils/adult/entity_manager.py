# -*- coding: utf-8 -*-
import hashlib
import logging
from typing import Optional, List, Dict, Type, Any
from django.db import transaction, IntegrityError
from django.db.models import Model
from django.core.exceptions import ObjectDoesNotExist

# ログ設定
logger = logging.getLogger('api_utils')

def get_or_create_entity(model: Type[Model], names: List[str], api_source: str) -> Dict[str, int]:
    """
    エンティティ名リストを受け取り、一括でget_or_createを実行し、{name: pk} のマップを返す。
    Maker, Genre, Actress などの slug フィールドには日本語の名前を直接格納します。
    """
    
    if not names:
        return {}
        
    # 重複を除去し、整形（空文字やNoneを除外）
    unique_names = list(set(name.strip() for name in names if name and isinstance(name, str) and name.strip()))
    if not unique_names:
        return {}

    pk_map: Dict[str, int] = {}
    
    # 1. 既存のレコードを一括で取得
    query_params: Dict[str, Any] = {'name__in': unique_names}
    if hasattr(model, 'api_source'):
        query_params['api_source'] = api_source

    # DBから既存データを引き抜く
    existing_entities = model.objects.filter(**query_params).values('pk', 'name')
    for entity in existing_entities:
        pk_map[entity['name']] = entity['pk']

    # 新規作成が必要な名前を特定
    existing_names = set(pk_map.keys())
    names_to_create = [name for name in unique_names if name not in existing_names]
    
    # すべて存在していれば即座に返す
    if not names_to_create:
        return pk_map

    # 2. 新規インスタンスを準備
    new_entities = []
    for name in names_to_create:
        fields = {
            'name': name,
        }
        
        # ✅ 修正ポイント: サイドバー表示とURL同期のため、slugに名前をそのまま入れる
        # モデルが slug フィールドを持っている場合に実行
        if hasattr(model, 'slug'):
            if model.__name__ == 'AdultAttribute':
                # AdultAttributeのみ、従来のハッシュ形式を維持（必要に応じて）
                fields['slug'] = f"attr-{hashlib.md5(name.encode('utf-8')).hexdigest()[:12]}"
            else:
                # Maker, Genre, Actress, Label, Series 等は名前をそのままスラグ化
                fields['slug'] = name
            
        # モデルごとの特殊フィールド処理（動的判定）
        if hasattr(model, 'api_source'):
            fields['api_source'] = api_source
            
        # Genreや一部エンティティに必要な一意識別ハッシュ
        if hasattr(model, 'api_id') or model.__name__ == 'Genre':
            fields['api_id'] = hashlib.md5(name.encode('utf-8')).hexdigest()
            
        # product_count の初期値
        if hasattr(model, 'product_count'):
            fields['product_count'] = 0

        new_entities.append(model(**fields))

    # 3. 一括作成 (bulk_create)
    try:
        if new_entities:
            with transaction.atomic():
                # ignore_conflicts=True により、同時実行時の重複エラーを回避
                model.objects.bulk_create(new_entities, ignore_conflicts=True)
            
        # 作成された（あるいは同時実行で既に存在した）レコードも含めて再取得し、pk_mapを完成させる
        final_entities = model.objects.filter(**query_params).values('pk', 'name')
        
        for entity in final_entities:
            pk_map[entity['name']] = entity['pk']
            
        logger.info(f"[{api_source}] {model.__name__}: 同期完了 (新規作成含む合計: {len(pk_map)} 件)")
        
    except Exception as e:
        logger.error(f"[{api_source}] {model.__name__} の一括同期中にエラー: {e}")
        # 失敗時も可能な限り既存のマップを返す
        pass 

    return pk_map