# ==========================================
# SHIN CORE LINX｜Semantic API Request URLs
# ==========================================

# Base
http://localhost:8083/api/general/


# ==========================================
# 1. 🏆 Ranking API
# ==========================================

# 全体ランキング
http://localhost:8083/api/general/pc-products/ranking/

# GPUランキング
http://localhost:8083/api/general/pc-products/ranking/gpu-rtx-4070/

# Usageランキング
http://localhost:8083/api/general/pc-products/ranking/usage-gaming/

# Makerランキング
http://localhost:8083/api/general/pc-products/ranking/maker-asus/


# ==========================================
# 2. 📦 Product List API
# ==========================================

# 一覧
http://localhost:8083/api/general/pc-products/

# Maker filter
http://localhost:8083/api/general/pc-products/?maker=ASUS

# Semantic attribute filter
http://localhost:8083/api/general/pc-products/?attribute=gpu-rtx-4070

# Multiple semantic filters
http://localhost:8083/api/general/pc-products/?attribute=gpu-rtx-4070&attribute=usage-gaming

# Price filter
http://localhost:8083/api/general/pc-products/?max_price=300000


# ==========================================
# 3. 📄 Product Detail API
# ==========================================

# 詳細
http://localhost:8083/api/general/pc-products/<unique_id>/

# Example
http://localhost:8083/api/general/pc-products/2557_sdc1625555401mpnojp/


# ==========================================
# 4. 🔗 Related Products API
# ==========================================

# 関連商品
http://localhost:8083/api/general/pc-products/<unique_id>/related/

# Example
http://localhost:8083/api/general/pc-products/2557_sdc1625555401mpnojp/related/


# ==========================================
# 5. 📊 Sidebar Stats API
# ==========================================

http://localhost:8083/api/general/pc-sidebar-stats/


# ==========================================
# 6. 🧠 Semantic Finder API
# ==========================================

http://localhost:8083/api/general/finder/


# ==========================================
# Semantic Payload Confirm
# ==========================================

# 以下が response に含まれていれば成功

{
  "semantic_schema_version": 1,

  "attributes": [...],

  "grouped_attributes": {
    "usage": [...],
    "gpu": [...],
    "cpu": [...],
    "maker": [...]
  }
}