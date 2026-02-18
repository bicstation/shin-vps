# -*- coding: utf-8 -*-
# api/models/__init__.py

# 1. 共通エンティティ・基盤
from .raw_and_entities import (
    RawApiData, Maker, Label, Genre, Actress, Director, Series, 
    EntityBase, Author
)

# 2. 【統合完了】FanzaProductはAdultProductに一本化されたため削除
# from .fanza_products import FanzaProduct  # ← これを消す！

# 3. アダルト製品（FANZA / DMM / DUGA 統合モデル）
from .adult_products import AdultProduct, FanzaFloorMaster, AdultAttribute

# 4. Linkshare 関連
from .linkshare_products import LinkshareProduct
from .linkshare_api_product import LinkshareApiProduct
from .bc_linkshare_products import BcLinkshareProduct

# 5. PC製品・価格履歴・属性
from .pc_products import PCProduct, PCAttribute, PriceHistory

# 6. ユーザー管理
from .users import User