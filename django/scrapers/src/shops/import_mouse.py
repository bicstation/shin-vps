import os
import django
import json
import sys
import urllib.parse
import re

# --- Django設定 ---
# 実行環境に合わせてパスを調整してください
sys.path.append('/usr/src/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiper_api.settings')
django.setup()

from api.models import PCProduct

def import_mouse_data():
    """
    マウスコンピューターの最新JSONをPCProductモデルへインポート。
    バリューコマースのMyLink形式に対応し、周辺機器を自動除外する。
    """
    # 💡 読み込みファイル名を確認してください
    json_path = "/usr/src/app/scrapers/src/json/mouse_results.json"
    
    # 💡 バリューコマース提携承認後に MyLink 用のベースURLを入力してください
    # 承認前は空のままでOKです（自動的に直リンクになります）
    VC_MYLINK_BASE = "" 
    # 例: "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892493739&vc_url="

    if not os.path.exists(json_path):
        print(f"❌ JSONファイルが見つかりません: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📥 {len(data)}件のデータをインポート開始（マウスコンピューター）...")

    success_count = 0
    skip_count_price = 0
    skip_count_peripheral = 0

    for item in data:
        product_url = item['url']
        price = item.get('price', 0)
        name = item.get('name', '商品名不明')
        unified_genre = item.get('unified_genre', 'bto-pc')

        # --- 1. 価格のバリデーション ---
        # 見積もり用や異常値をスキップ
        if price <= 100:
            skip_count_price += 1
            continue

        # --- 2. 周辺機器の除外（自作PC提案に不要なもの） ---
        # モニター(iiyamaブランド)や取付ブラケット、unified_genreがmonitorのものを除外
        is_peripheral = any(x in name.upper() for x in ["PROLITE", "G-MASTER", "ブラケット", "液晶ディスプレイ"])
        if unified_genre == "monitor" or is_peripheral:
            skip_count_peripheral += 1
            continue

        # --- 3. Unique IDの生成 ---
        # マウスのURL末尾を抽出し、メーカー接頭辞 'MSE' を付与
        url_parts = product_url.rstrip('/').split('/')
        product_code = url_parts[-1]
        unique_id = f"MSE_{product_code}"
        
        # --- 4. アフィリエイトURL（ValueCommerce MyLink）の生成 ---
        if VC_MYLINK_BASE:
            # 商品URLをエンコードしてベースURLと結合
            encoded_url = urllib.parse.quote(product_url, safe='')
            affiliate_url = f"{VC_MYLINK_BASE}{encoded_url}"
        else:
            affiliate_url = product_url # 提携前は直リンクを格納
        
        # --- 5. 詳細テキスト（description）のクレンジング ---
        raw_description = item.get('description', '')
        # <br> を改行に置換し、他のHTMLタグをすべて除去
        clean_description = re.sub(r'<br\s*/?>', '\n', raw_description)
        clean_description = re.sub(r'<[^>]*?>', '', clean_description)
        # 連続改行や端の空白をトリミング
        clean_description = clean_description.strip()

        try:
            # データの更新または作成
            PCProduct.objects.update_or_create(
                unique_id=unique_id,
                defaults={
                    'site_prefix': 'MSE',
                    'maker': 'mouse',
                    'name': name,
                    'price': price,
                    'url': product_url,
                    'affiliate_url': affiliate_url,
                    'image_url': item.get('image_url', ''),
                    'description': clean_description,
                    'raw_genre': item.get('raw_genre', 'PC'),
                    'unified_genre': unified_genre, # laptop / desktop
                    'stock_status': '在庫あり',
                    'is_active': True,
                }
            )
            success_count += 1
            if success_count % 50 == 0:
                print(f"   ... {success_count}件 処理済み")

        except Exception as e:
            print(f"   ❌ エラー ({unique_id}): {e}")

    print(f"\n✨ インポート完了報告")
    print(f"----------------------------------------")
    print(f"✅ 登録/更新成功       : {success_count} 件")
    print(f"⚠️ スキップ（低価格）   : {skip_count_price} 件")
    print(f"⚠️ スキップ（周辺機器） : {skip_count_peripheral} 件")
    print(f"----------------------------------------")
    
    if not VC_MYLINK_BASE:
        print(f"ℹ️  [提携申請中] ValueCommerce承認後に VC_MYLINK_BASE を設定して再実行するとリンクが収益化されます。")

if __name__ == "__main__":
    import_mouse_data()