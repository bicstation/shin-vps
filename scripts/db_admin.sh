#!/bin/bash
# scripts/db_admin.sh
source "$(dirname "$0")/env.sh"

echo -e "\n${YELLOW}--- 🗄️  DATABASE & MASTER MANAGEMENT ---${RESET}"
echo "1) マイグレーション (DB更新)"
echo "2) 属性マスタ同期 (attributes.tsv)"
echo "3) スーパーユーザー作成"
echo "4) APIエンドポイント一覧表示"
echo "5) サイトマップ手動更新"
echo "b) 戻る"
read -p ">> " OPT
case $OPT in
    1) run_django python manage.py makemigrations api && run_django python manage.py migrate ;;
    2) 
        docker cp "${PROJECT_ROOT}/django/master_data/attributes.tsv" "${DJANGO_CON}:/usr/src/app/master_data/attributes.tsv"
        run_django python manage.py shell <<'EOF'
import os, re
from django.db import connection
from api.models.pc_products import PCAttribute
with connection.cursor() as cursor:
    cursor.execute('TRUNCATE TABLE api_pcattribute RESTART IDENTITY CASCADE;')
unique_attrs = {}
with open('/usr/src/app/master_data/attributes.tsv', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('attr_type'): continue
        parts = re.split(r'\t+|\s{2,}', line)
        if len(parts) < 3: continue
        slug = parts.strip().lower()
        unique_attrs[slug] = {'attr_type': parts.strip(), 'name': parts.strip(), 'order': int(float(parts[-1])) if parts[-1].replace('.','').isdigit() else 0}
for slug, data in unique_attrs.items():
    PCAttribute.objects.get_or_create(slug=slug, defaults=data)
EOF
        run_django python manage.py auto_map_attributes ;;
    3) run_django python manage.py createsuperuser ;;
    4) run_django python manage.py show_urls | sed "s|^\/|${BASE_URL}/|g" ;;
    5) run_next node /app/generate-sitemap.mjs ;;
    *) exit 0 ;;
esac
pause