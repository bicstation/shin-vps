import os
import sys
import django

# Django環境のセットアップ
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models.pc_products import PCAttribute

def run():
    file_path = '/usr/src/app/master_data/attributes.tsv'
    
    if not os.path.exists(file_path):
        print(f"❌ Error: {file_path} not found.")
        return

    # 既存データのクリア
    PCAttribute.objects.all().delete()
    print("🧹 Existing attributes cleared.")

    count = 0
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        if not lines:
            return
            
        # ヘッダー飛ばし
        for line in lines[1:]:
            parts = line.strip().split('\t')
            if len(parts) < 3:
                continue
            
            attr_type, name, slug = parts[0], parts[1], parts[2]
            
            # orderの数値変換 (510.5などの小数対応)
            try:
                order = int(float(parts[-1]))
            except (ValueError, IndexError):
                order = 0
            
            PCAttribute.objects.create(
                attr_type=attr_type,
                name=name,
                slug=slug,
                order=order
            )
            count += 1

    print(f"✅ {count} attributes imported successfully.")

if __name__ == "__main__":
    run()