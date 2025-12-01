import logging
from django.db import transaction
# モデルのインポートは utils ファイル内で行う
from api.models import RawApiData 
from typing import List, Dict, Any

# ロガーのセットアップ (共通の utils ロガーを使用)
logger = logging.getLogger('api_utils')
# logger.setLevel(logging.DEBUG) # 実行環境の settings.py に依存させる

def bulk_insert_or_update(batch: List[Dict[str, Any]]):
    """
    RawApiDataモデルに対して、一括で挿入または更新を行います（UPSERT）。

    Args:
        batch (list): RawApiDataに挿入または更新するためのデータ辞書のリスト。
                      各辞書は、'api_source'と'api_product_id'を含む必要があります。
    """
    if not batch:
        return

    Model = RawApiData
    
    # 競合時に更新するフィールドを定義。
    # raw_json_data (ペイロード), api_service, api_floor (メタデータ), updated_at (タイムスタンプ)
    update_fields = ['raw_json_data', 'api_service', 'api_floor', 'updated_at']
    
    # 一意性を保証するフィールド (複合ユニークインデックス)
    unique_fields = ['api_source', 'api_product_id'] 

    try:
        with transaction.atomic():
            # 辞書のリストをモデルインスタンスのリストに変換
            # NOTE: ここでインスタンス生成時にデータが検証されるため、
            # コマンド側で created_at/updated_at を設定していることが重要。
            instances_to_create = [Model(**data) for data in batch]
            
            # bulk_createを使用して一括UPSERTを実行 (Django 3.2+が必要)
            Model.objects.bulk_create(
                instances_to_create,
                update_conflicts=True,  # 競合が発生した場合に更新を行う
                unique_fields=unique_fields,  # 競合判定に使用するフィールド
                update_fields=update_fields,  # 競合発生時に更新するフィールド
            )
            logger.info(f"RawApiDataに {len(batch)} 件のデータを一括で挿入/更新しました。")
            
    except Exception as e:
        # エラーが発生した場合、トランザクションはロールバックされる
        logger.error(f"RawApiDataのbulk_create/update中にエラーが発生し、ロールバックされました: {e}")