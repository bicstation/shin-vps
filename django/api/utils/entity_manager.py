import hashlib
from typing import Optional
from django.db import transaction, IntegrityError
from django.db.models import Model
from django.core.exceptions import ObjectDoesNotExist

# ログ設定
import logging
logger = logging.getLogger('api_utils')
# logger.setLevel(logging.DEBUG) # 実行環境の settings.py に依存させる

def get_or_create_entity(model: type[Model], api_source: str, name: str, api_id: str | None = None) -> int | None:
    """
    エンティティ（Maker, Genreなど）を取得または作成し、そのプライマリキー（ID）を返す。
    
    Args:
        model (type[Model]): 対象となるモデルクラス。
        api_source (str): APIソース名 ('FANZA', 'DUGA'など)。
        name (str): エンティティの名称。
        api_id (str | None): API提供のID。
        
    Returns:
        int | None: エンティティのデータベースID、またはエラー時はNone。
    """
    if not name or not api_source:
        return None
    
    # -----------------------------------------------------------
    # 1. api_id の決定 (GenreやAPI IDがない場合)
    # -----------------------------------------------------------
    api_id_to_use = api_id
    # Genreかつapi_idがない場合、nameのMD5ハッシュ値を使用
    if model.__name__ == 'Genre' and api_id is None:
        api_id_to_use = hashlib.md5(name.encode('utf-8')).hexdigest()
    
    # -----------------------------------------------------------
    # 2. 検索条件の定義
    # -----------------------------------------------------------
    
    # 基本的な検索条件は api_source と name
    search_kwargs = {
        'api_source': api_source,
        'name': name,
    }
    
    # デフォルト値
    defaults_kwargs = {
        'api_id': api_id_to_use,
    }
    
    try:
        # トランザクション内で get_or_create を実行
        with transaction.atomic():
            entity, created = model.objects.get_or_create(
                **search_kwargs,
                defaults=defaults_kwargs
            )
            
            if created:
                logger.info(f"[{api_source}:{model.__name__}] 新規エンティティを作成: {name}")
                
            return entity.id
            
    except IntegrityError:
        # -----------------------------------------------------------
        # 3. IntegrityError (競合) 発生時の処理
        # -----------------------------------------------------------
        # 競合により作成に失敗したが、レコードは既に存在しているはず。
        # 再度検索して既存のレコードを取得する。
        
        logger.warning(
            f"[{api_source}:{model.__name__}] Integrity Errorが発生 (名前: {name})。既存レコードを再取得します。"
        )
        
        try:
            # 競合を起こしたフィールドを使ってレコードを再取得
            # 検索条件を絞る必要がある (api_source と name で再検索)
            entity = model.objects.get(**search_kwargs)
            return entity.id
        except ObjectDoesNotExist:
            # まれに競合したレコードが消えている可能性、または検索条件が不十分な可能性
            logger.error(f"[{api_source}:{model.__name__}] 競合後の再検索に失敗しました: {name}")
            return None
        except Exception as e:
            logger.error(f"[{api_source}:{model.__name__}] 競合後の再検索中に予期せぬエラーが発生: {e}")
            return None
            
    except Exception as e:
        logger.error(f"[{api_source}:{model.__name__}] エンティティの取得/作成中に予期せぬエラーが発生: {e}")
        return None