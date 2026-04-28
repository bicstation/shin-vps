#!/bin/bash
set -e

echo "======================================"
echo "🧹 STEP1: 属性クリア"
echo "======================================"

docker exec -i django-v3 python manage.py shell <<EOF
from api.models import PCProduct
count = 0
for p in PCProduct.objects.all():
    p.attributes.clear()
    count += 1
print(f"✅ attributes cleared: {count}件")
EOF

echo "======================================"
echo "🧠 STEP2: 再マッピング"
echo "======================================"

docker exec -it django-v3 python manage.py auto_map_attributes

echo "======================================"
echo "🔄 STEP3: Product同期"
echo "======================================"

docker exec -it django-v3 python manage.py migrate_pc_products

echo "======================================"
echo "📊 STEP4: スコア更新（←追加）"
echo "======================================"

docker exec -it django-v3 python manage.py update_product_scores

echo "======================================"
echo "📦 STEP5: 件数確認"
echo "======================================"

docker exec -i django-v3 python manage.py shell <<EOF
from api.models import Product
print(f"📦 Product count: {Product.objects.count()}")
EOF

echo "======================================"
echo "🧪 STEP6: 上位確認"
echo "======================================"

curl http://localhost:8083/api/products/ranking/ | head -n 20

echo "======================================"
echo "✅ 完了"
echo "======================================"