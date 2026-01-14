import os
import django
import json
import sys
import urllib.parse
import re

# --- Django設定 ---
# 既存のAcerインポートスクリプトの構造に準拠
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def import_mouse_data():
    """
    マウスコンピューターのJSONをPCProductモデルへインポート。
    価格バリデーション、HTMLタグ除去、将来のアフィリエイト変換に対応。
    """
    # 💡 データの読み込みパス
    json_path = "/usr/src/app/scrapers/src/json/mouse_results.json"
    
    # 💡 アフィリエイトベースURL (提携承認後にここに値を入力してください)
    # 承認前は空文字のままでOKです。空の場合は直リンクがurlとaffiliate_urlの両方に入ります。
    # 例: "https://px.a8.net/svt/ejp?a8mat=XXXXX+YYYYY+ZZZZ&a8ejpredirect="
    A8_BASE_URL = "" 

    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📥 {len(data)}件のデータをインポート開始（マウスコンピューター）...")

    success_count = 0
    skip_count = 0

    for item in data:
        product_url = item['url']
        price = item.get('price', 0)

        # --- 1. 価格のバリデーション ---
        # 1円などの異常値や、見積もり用ページをスキップ
        if price <= 100:
            skip_count += 1
            continue

        # --- 2. Unique IDの生成 ---
        # マウスのURL末尾（製品コード）を抽出し、メーカー接頭辞 'MSE' を付与
        # 例: .../g/gngear-j6a.../ -> MSE_gngear-j6a...
        url_parts = product_url.rstrip('/').split('/')
        product_code = url_parts[-1]
        unique_id = f"MSE_{product_code}"
        
        # --- 3. アフィリエイトURLの生成 ---
        # 提携承認後に A8_BASE_URL が埋まれば、自動的にエンコードして結合
        if A8_BASE_URL:
            encoded_url = urllib.parse.quote(product_url, safe='')
            affiliate_url = f"{A8_BASE_URL}{encoded_url}"
        else:
            affiliate_url = product_url # 提携前は直リンクを格納
        
        # --- 4. 詳細テキスト（description）のクレンジング ---
        raw_description = item.get('description', '')
        # <br> タグを改行文字 \n に置換
        clean_description = re.sub(r'<br\s*/?>', '\n', raw_description)
        # その他の全てのHTMLタグ（<a>, <span>等）を除去
        clean_description = re.sub(r'<[^>]*?>', '', clean_description)
        # 連続する改行や空白を整理
        clean_description = clean_description.strip()

        try:
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'MSE',
                    'maker': 'mouse',
                    'name': item['name'],
                    'price': price,
                    'url': product_url,              # オリジナルのURL
                    'affiliate_url': affiliate_url,  # ✨ 提携後に変換されるURL
                    'image_url': item.get('image_url', ''),
                    'description': clean_description,
                    'raw_genre': 'PC',
                    'unified_genre': 'PC',
                    'stock_status': '在庫あり',
                    'is_active': True,
                }
            )
            success_count += 1
        except Exception as e:
            print(f"   ❌ エラー ({unique_id}): {e}")

    print(f"\n✨ 完了報告")
    print(f"✅ 登録/更新成功: {success_count} 件")
    print(f"⚠️ スキップ（1円データ等）: {skip_count} 件")
    if not A8_BASE_URL:
        print(f"ℹ️  [提携申請中モード] 現在は直リンクで登録されています。承認後にA8_BASE_URLを書き換えて再実行してください。")

if __name__ == "__main__":
    import_mouse_data()