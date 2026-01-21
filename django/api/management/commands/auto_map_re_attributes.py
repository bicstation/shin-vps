import os
import django
import json
import csv

# --- Django初期化 ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()
from api.models import BcLinkshareProduct, AttributeMaster # 属性マスターモデルがあると仮定

def remap_ai_articles():
    # 1. 最新のTSV（属性マスター）を読み込む
    # DBのAttributeMasterテーブルが更新されている前提、もしくは直接TSVをロード
    attributes = AttributeMaster.objects.all()
    
    # 2. 対象となる商品（例：ASUSやマウス）を抽出
    products = BcLinkshareProduct.objects.filter(mid__in=["43708", "38221"])
    
    print(f"🔄 {products.count()} 件の記事を再マッピング中...")

    for product in products:
        # AIが抽出した生のテキスト、または既存の解析済みJSONをマージ
        target_content = ""
        ai_data = product.ai_extracted_json or {}
        
        # 判定対象の文字列を作成（商品名 + AI抽出スペック + 生テキスト）
        target_content = f"{product.product_name} {json.dumps(ai_data, ensure_ascii=False)}"
        
        new_tags = []
        for attr in attributes:
            # 各属性のキーワードをループ
            keywords = [k.strip() for k in attr.search_keywords.split(',')]
            for kw in keywords:
                if kw.lower() in target_content.lower():
                    new_tags.append(attr.slug)
                    break # 1つの属性につき1キーワードマッチすればOK
        
        # 3. データベースのタグ情報を更新
        # product.tags = ",".join(list(set(new_tags))) # 例：カンマ区切りで保存する場合
        # product.save()
        
    print("✅ 再マッピングが完了しました。")

if __name__ == "__main__":
    remap_ai_articles()