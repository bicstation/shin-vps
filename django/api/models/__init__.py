# -*- coding: utf-8 -*-
# api/models/__init__.py

# 1. 共通エンティティ・基盤
from .raw_and_entities import (
    RawApiData, Maker, Label, Genre, Actress, Director, Series, 
    EntityBase, Author  # ← 読み放題用にAuthorを追加
)

# 2. FANZA / DMM 完全最適化モデル（今回作成したもの）
from .fanza_products import FanzaProduct
# 3. 成人向け製品（既存）
from .adult_products import AdultProduct, AdultAttribute ,FanzaFloorMaster


# 4. Linkshare 関連（外部アフィリエイト等）
from .linkshare_products import LinkshareProduct
from .linkshare_api_product import LinkshareApiProduct
from .bc_linkshare_products import BcLinkshareProduct

# 5. PC製品・価格履歴・属性
from .pc_products import PCProduct, PCAttribute, PriceHistory

# 6. ユーザー管理
from .users import User

# 💡 これで Django は 'FanzaProduct' や 'Author' を正しくモデルとして認識します。