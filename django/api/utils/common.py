import logging
from typing import Optional

# --------------------------------------------------------------------------
# 1. ロガーのセットアップ (全ての utils ファイルで使用される共通ロガー)
# --------------------------------------------------------------------------

# ロガーのセットアップ
logger = logging.getLogger('api_utils')


# --------------------------------------------------------------------------
# 2. 商品のユニークID生成 (AdultProduct.product_id_unique フィールド用)
# --------------------------------------------------------------------------

def generate_product_unique_id(api_source: str, api_raw_id: str, prefix_type: Optional[str] = None) -> str:
    """
    APIソースと生のAPI商品IDから、データベース内で一意となるIDを生成します。
    
    Args:
        api_source (str): APIソース名 ('FANZA', 'DUGA' など)。
        api_raw_id (str): APIから取得したオリジナルの商品ID (例: 'ssis-123', '0100dg-001')。
        prefix_type (Optional[str]): 識別用のプレフィックス (現在は未使用)。
                                     
    Returns:
        str: データベースでの一意なID (例: 'FANZA_ssis-123', 'DUGA_0100dg-001')。
    """
    
    # 修正: すべてのソースで一貫性を持たせるためにアンダースコア '_' を使用します。
    # 例: FANZA_ssis-123, DUGA_0100dg-001
    
    return f"{api_source}_{api_raw_id}"