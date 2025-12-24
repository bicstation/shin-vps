import time
import csv
import os
import sys
import re
from playwright.sync_api import sync_playwright

# パス解決
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
if project_root not in sys.path:
    sys.path.append(project_root)

def scrape_arkhive():
    output_dir = os.path.join(project_root, "data", "raw")
    os.makedirs(output_dir, exist_ok=True)
    output_csv = os.path.join(output_dir, "ark_products.csv")
    
    # 教えていただいた arkhive の一覧ページ
    target_url = "https://www.ark-pc.co.jp/bto/special/arkhive/"
    total_count = 0

    print(f"🔗 アーク（arkhive）にアクセス中...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 画面サイズを少し大きめに設定
        context = browser.new_context(viewport={'width': 1280, 'height': 1080})
        page = context.new_page()

        try:
            # ページ読み込み
            page.goto(target_url, wait_until="domcontentloaded", timeout=60000)
            
            # アークのBTOページは商品が '.bto-item' などのクラスで並んでいます
            # ページ内の「商品ブロック」を特定
            items = page.query_selector_all(".bto-item, .item")

            if not items:
                # クラス名が違った場合の予備策：詳細ボタンがある枠を探す
                items = page.query_selector_all(".product-card, .list-product")

            with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.writer(f)
                writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])

                for item in items:
                    try:
                        # 商品名
                        name_el = item.query_selector(".title, .product-title, h3")
                        if not name_el: continue
                        name = name_el.inner_text().strip()

                        # 価格
                        price_el = item.query_selector(".price, .amount")
                        if not price_el: continue
                        price_text = price_el.inner_text()
                        # 数字だけを抽出
                        price = int(re.sub(r'\D', '', price_text))

                        # URL (aタグのhrefを取得)
                        link_el = item.query_selector("a")
                        href = link_el.get_attribute("href") if link_el else ""
                        url = "https://www.ark-pc.co.jp" + href if href.startswith('/') else href

                        # 説明/スペック
                        spec_el = item.query_selector(".spec, .description")
                        description = spec_el.inner_text().replace('\n', ' ').strip() if spec_el else ""

                        # CSVに保存
                        writer.writerow(['arkhive', name, price, url, "", description])
                        total_count += 1
                        print(f"✅ 取得成功: {name[:25]}... ({price}円)")

                    except Exception as e:
                        continue

        except Exception as e:
            print(f"❌ エラー発生: {e}")
        finally:
            browser.close()
    
    print(f"\n✨ 完了！アークから {total_count} 件取得しました。")
    print(f"📂 保存先: {output_csv}")

if __name__ == "__main__":
    scrape_arkhive()