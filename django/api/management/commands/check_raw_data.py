from api.models.adult_products import AdultProduct
import json

# 最新のデータを1件取得
product = AdultProduct.objects.exclude(raw_data__isnull=True).first()

if product and product.raw_data:
    print(f"=== Product: {product.title} ===")
    print(f"API Source: {product.api_source}")
    
    # RawApiDataの全フィールド名を確認
    raw = product.raw_data
    fields = [f.name for f in raw._meta.get_fields()]
    print(f"RawApiData Fields: {fields}")

    # JSONデータの中身（辞書型）を表示
    # 一般的には .data や .json_payload などの名前で格納されています
    # ここでは hasattr を使って中身を探します
    content = None
    for attr in ['data', 'json_data', 'content', 'response']:
        if hasattr(raw, attr):
            content = getattr(raw, attr)
            print(f"--- Found content in field: '{attr}' ---")
            break
    
    if content:
        # 辞書の中にある「説明文」っぽいきーを探す
        if isinstance(content, str):
            try: content = json.loads(content)
            except: pass
            
        print("JSON Keys:", content.keys() if isinstance(content, dict) else "Not a dict")
        
        # FANZA/DUGAでよくある説明文キー
        for key in ['review', 'introduction', 'item_info', 'comment', 'description']:
            if key in content:
                print(f"\n[Found Description Key: {key}]")
                print(str(content[key])[:200] + "...")
    else:
        print("Could not find a JSON-like field in RawApiData.")
else:
    print("No product with raw_data found.")