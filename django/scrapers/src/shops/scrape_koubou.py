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

def scrape_koubou_ultimate():
    output_dir = os.path.join(project_root, "data", "raw")
    os.makedirs(output_dir, exist_ok=True)
    output_csv = os.path.join(output_dir, "pc_koubou_products.csv")
    
    target_url = "https://www.pc-koubou.jp/pc/level_infinity_n.php"
    total_count = 0

    with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])

    with sync_playwright() as p:
        # 【重要】ヘッドレスモードをOFFにすることを強く推奨します
        # 画面を表示することで、ボット検知を劇的に回避しやすくなります
        browser = p.chromium.launch(headless=True) # もしダメならここを False に
        
        # ボットだとバレないように詳細な偽装設定
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        print(f"🔗 アクセス開始: {target_url}")
        
        try:
            # タイムアウトを長めに設定し、ネットワークが静かになるまで待つ
            page.goto(target_url, wait_until="networkidle", timeout=90000)
            
            # 【重要】人間が操作しているように見せるため、少しずつスクロール
            print("⏳ JavaScriptの実行と商品描画を待機中...")
            for i in range(10):
                page.mouse.wheel(0, 800)
                time.sleep(0.5)
            
            # 商品データの描画をさらに待つ
            page.wait_for_timeout(5000)

            # パソコン工房の特設ページでよく使われるクラス名を総当たりで探す
            # リンク (detail.php) を起点にするのが一番確実
            product_links = page.query_selector_all("a[href*='detail.php']")
            seen_urls = set()

            for link in product_links:
                href = link.get_attribute("href")
                if not href or href in seen_urls:
                    continue
                
                full_url = "https://www.pc-koubou.jp" + href if href.startswith('/') else href
                seen_urls.add(href)

                # ブラウザ内部のJSで、リンクの「親要素」からテキストを直接引っこ抜く
                item_data = page.evaluate("""(el) => {
                    let parent = el.closest('div, li, section');
                    if (!parent) return null;
                    
                    // 「円」を含む文字列を探して価格を抽出
                    let text = parent.innerText;
                    let priceMatch = text.replace(/,/g, '').match(/(\\d+)円/);
                    let price = priceMatch ? priceMatch[1] : "0";
                    
                    // 商品名（h3タグや、特定のクラスを探す）
                    let nameEl = parent.querySelector('h3, .name, .product_item__name');
                    let name = nameEl ? nameEl.innerText.trim() : "";
                    
                    if(!name) {
                        // 名前が見つからない場合はテキストの1行目を使用
                        name = text.split('\\n').find(line => line.trim().length > 5) || "";
                    }
                    
                    return { name, price };
                }""", link)

                if item_data and int(item_data['price']) > 30000: # 3万円以上のPCのみ
                    with open(output_csv, 'a', newline='', encoding='utf-8-sig') as f:
                        writer = csv.writer(f)
                        writer.writerow(['level_infinity', item_data['name'], item_data['price'], full_url, "", ""])
                    
                    total_count += 1
                    print(f"📦 取得成功: {item_data['name'][:25]}... | {item_data['price']}円")

        except Exception as e:
            print(f"❌ エラー発生: {e}")
        finally:
            browser.close()
    
    print(f"\n✨ スクレイピング完了！累計: {total_count}件")
    if total_count == 0:
        print("💡 ヒント: それでも0件の場合、スクリプトの 'headless=True' を 'False' に書き換えて、ブラウザが何を表示しているか見てみましょう。")

if __name__ == "__main__":
    scrape_koubou_ultimate()