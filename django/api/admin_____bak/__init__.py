# api/admin/__init__.py
import logging

# 二重登録を防ぐためのヘルパー
def safe_import():
    try:
        from . import base
        from . import adult_products
        from . import pc_products
        from . import masters
    except Exception as e:
        logging.error(f"Admin import error: {e}")

safe_import()