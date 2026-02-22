# -*- coding: utf-8 -*-
import hashlib
import logging
import re
from typing import List, Dict, Type, Any, Optional
from django.db import transaction
from django.db.models import Model
from django.utils.text import slugify

logger = logging.getLogger('api_utils')

def _generate_deterministic_id(name: str) -> str:
    """
    名前に基づく決定論的なハッシュIDを生成。
    表記揺れ（前後の空白や大文字小文字）を正規化した上でハッシュ化し、名寄せ精度を高める。
    """
    normalized_name = name.strip().lower()
    return hashlib.md5(normalized_name.encode('utf-8')).hexdigest()

def get_or_create_entity(model: Type[Model], names: List[str], api_source: str) -> Dict[str, int]:
    """
    メーカー、女優、ジャンル等のマスタを一括で取得・作成し、{名前: PK} のマップを返す。
    
    【主な改良点】:
    1. slugifyの日本語対応失敗時のフォールバック。
    2. API出所(api_source)ごとの名前空間分離に対応。
    3. bulk_create後の再取得をアトミックに行い、マルチスレッド環境でのPKズレを防止。
    """
    if not names:
        return {}
        
    # 1. 名前のクレンジング（重複排除・空白除去・空文字除外）
    unique_names = list(set(
        name.strip() for name in names 
        if name and isinstance(name, str) and name.strip()
    ))
    
    if not unique_names:
        return {}

    pk_map: Dict[str, int] = {}
    source_key = api_source.lower()
    
    # モデルのフィールド構成に合わせた検索条件
    query_params: Dict[str, Any] = {'name__in': unique_names}
    if hasattr(model, 'api_source'):
        query_params['api_source'] = source_key

    # 2. 既存のエンティティをチェック（一括取得）
    try:
        existing_entities = model.objects.filter(**query_params).values('pk', 'name')
        for entity in existing_entities:
            pk_map[entity['name']] = entity['pk']
    except Exception as e:
        logger.error(f"[{api_source}] {model.__name__} 既存取得フェーズでエラー: {e}")

    # すべて存在していればDB挿入をスキップ
    names_to_create = [name for name in unique_names if name not in pk_map]
    if not names_to_create:
        return pk_map

    # 3. 新規エンティティのオブジェクト生成（メモリ上）
    new_objs = []
    for name in names_to_create:
        fields = {'name': name}
        
        # スラグ（URL識別子）の生成
        if hasattr(model, 'slug'):
            if model.__name__ == 'AdultAttribute':
                # 属性モデルなどはハッシュ値をスラグに採用して衝突回避
                fields['slug'] = f"attr-{_generate_deterministic_id(name)[:12]}"
            else:
                # 一般マスタは名前をベースにするが、日本語等で空になる場合はハッシュで補完
                s_base = slugify(name)
                if not s_base:
                    fields['slug'] = _generate_deterministic_id(name)[:16]
                else:
                    fields['slug'] = s_base[:50]
            
        # 出所管理フィールドがある場合
        if hasattr(model, 'api_source'):
            fields['api_source'] = source_key
            
        # 決定論的なAPI IDの割り当て
        if hasattr(model, 'api_id'):
            fields['api_id'] = _generate_deterministic_id(name)
            
        # 商品カウントなどの初期値
        if hasattr(model, 'product_count'):
            fields['product_count'] = 0

        new_objs.append(model(**fields))

    # 4. 一括挿入とPK再マップ（トランザクション保護）
    try:
        if new_objs:
            with transaction.atomic():
                # ignore_conflicts=True で、別プロセスとの同時挿入によるUnique制約違反を回避
                model.objects.bulk_create(new_objs, ignore_conflicts=True)
                
                # PKが確定した全エンティティを再取得してマップを完成させる
                # (PostgreSQL/MySQL等の連番PKを確実に取得するため、挿入直後に再クエリ)
                final_entities = model.objects.filter(**query_params).values('pk', 'name')
                for entity in final_entities:
                    pk_map[entity['name']] = entity['pk']
                
        logger.info(f"[{api_source}] {model.__name__} 同期完了: 登録試行={len(new_objs)}, 最終マップ件数={len(pk_map)}")
        
    except Exception as e:
        logger.error(f"[{api_source}] {model.__name__} bulk_createプロセスでエラー: {e}")

    return pk_map

def update_entity_counts(model: Type[Model], pk_list: List[int]):
    """
    (拡張用) 紐づくプロダクト数のカウントを更新。
    定期的なバッチ、またはセーブ処理の最後に呼び出して統計情報を更新する。
    """
    if not hasattr(model, 'product_count') or not pk_list:
        return
    
    # 実装例: annotateを用いて一括更新クエリを実行
    # model.objects.filter(pk__in=pk_list).update(...)
    pass