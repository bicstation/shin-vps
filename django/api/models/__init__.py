# api/models/__init__.py

from .raw_and_entities import RawApiData, Maker, Label, Genre, Actress, Director, Series, EntityBase

# 分割した新しいファイルから個別にインポートする
from .adult_products import AdultProduct
from .linkshare_products import LinkshareProduct  # 既存(CSV等)
from .linkshare_api_product import LinkshareApiProduct  # 既存API全取得用
from .bc_linkshare_products import BcLinkshareProduct  # 💡 新規: Bic-saving専用

# 💡 PC製品用モデルと、新しく追加した属性モデルをインポート
# PCAttribute を追加することで admin.py から参照可能になります
from .pc_products import PCProduct, PCAttribute