import os
import sys
import django

# Django環境のセットアップ
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models.pc_products import PCAttribute

file_path = '/usr/src/app/master_data/attributes.tsv'
count = 0
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) < 3 or parts[0] == 'attr_type': continue
            
            attr_type, name, slug = parts[0], parts[1], parts[2]
            order = int(parts[-1]) if parts[-1].isdigit() else 0
            
            # get_or_createで重複を回避
            obj, created = PCAttribute.objects.get_or_create(
                slug=slug,
                defaults={'attr_type': attr_type, 'name': name, 'order': order}
            )
            if created: count += 1
    print(f"✅ {count} 件の属性を新規登録しました。")
except Exception as e:
    print(f"❌ エラーが発生しました: {e}")
