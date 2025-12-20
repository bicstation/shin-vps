import time
import csv
import random
import os
from playwright.sync_api import sync_playwright

def scrape_acer_to_csv_realtime():
    # 1. 保存パスをスクリプトと同じフォルダに固定
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv = os.path.join(base_dir, "acer_detailed_final.csv")
    
    base_url = "https://store.acer.com/ja-jp/notebooks?p="
    last_page_data = set()
    total_count = 0

    # CSVを新規作成してヘッダーを書き込む
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'price', 'url', 'image_url', 'description'])

    with sync_playwright() as p:
        # ブラウザ起動（ヘッドレス解除 + 通信エラー対策）
        browser = p.chromium.launch(
            headless=False, 
            args=['--disable-http2', '--disable-blink-features=AutomationControlled']
        )
        
        context = browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        )
        page = context.new_page()

        page_num = 1
        while True:
            current_url = f"{base_url}{page_num}"
            print(f"📄 ページ {page_num} を読み込み中...")
            
            try:
                # ページ遷移。domcontentloadedより確実なcommitを使用
                page.goto(current_url, wait_until="commit", timeout=90000)
                
                # 💡 サイトが重いため、要素を探す前に数秒間待機（これ重要です）
                page.wait_for_timeout(5000) 

                # 商品リストが表示されるまで最大20秒粘る
                try:
                    page.wait_for_selector(".product-item-info", state="attached", timeout=20000)
                except:
                    print(f"🏁 これ以上商品が見つからないか、読み込みに失敗しました。終了します。")
                    break

                # 💡 LazyLoad対策：小刻みにスクロールして画像を確定させる
                for _ in range(8):
                    page.evaluate("window.scrollBy(0, 700)")
                    time.sleep(0.4)
                
                # 取得前の最終待機
                page.wait_for_timeout(2000)

                items = page.query_selector_all(".product-item-info")
                current_page_names = []

                # 2. メモリ対策：ページ内のアイテムを1件ずつ処理して即保存
                for item in items:
                    try:
                        name_el = item.query_selector(".product-item-name a")
                        price_el = item.query_selector("span.price")
                        
                        if name_el and price_el:
                            name = name_el.inner_text().strip()
                            item_url = name_el.get_attribute("href") or ""
                            
                            # 画像取得（pixel.jpgを徹底排除）
                            img_el = item.query_selector(".product-image-photo")
                            image_url = ""
                            if img_el:
                                # 要素を視界に入れて確実にURLを生成させる
                                img_el.scroll_into_view_if_needed()
                                for attr in ["data-src", "src", "data-original"]:
                                    candidate = img_el.get_attribute(attr)
                                    if candidate and "pixel.jpg" not in candidate and candidate.startswith("http"):
                                        image_url = candidate
                                        break
                            
                            # ⚠️ 画像が取れない（pixelのまま）なら保存しない
                            if not image_url:
                                print(f"⚠️ 画像取得待ちのためスキップ: {name[:20]}...")
                                continue

                            # 価格と詳細説明
                            price_text = price_el.inner_text()
                            price = int(price_text.replace('¥', '').replace(',', '').replace(' ', ''))
                            desc_el = item.query_selector(".product-item-details .description") or item.query_selector(".product-item-details")
                            description = desc_el.inner_text().replace('\n', ' / ').strip() if desc_el else ""

                            current_page_names.append(name)

                            # 💡 1件ずつCSVへ追記（メモリを食わず、クラッシュにも強い）
                            with open(output_csv, 'a', newline='', encoding='utf-8') as f:
                                writer = csv.writer(f)
                                writer.writerow([name, price, item_url, image_url, description])
                            
                            total_count += 1
                    except:
                        continue
                
                # 重複チェック（前のページと同じ内容なら終了）
                current_page_set = set(current_page_names)
                if not current_page_names or (last_page_data and current_page_set.issubset(last_page_data)):
                    print("🏁 全データの取得が完了しました。")
                    break

                last_page_data = current_page_set
                print(f"✅ ページ {page_num} 完了（累計: {total_count}件）")
                
                page_num += 1
                # サーバーへのマナーとして待機
                time.sleep(random.uniform(3.0, 5.0))

            except Exception as e:
                print(f"⚠️ エラー発生: {e}")
                break

        browser.close()
    
    print(f"\n✨ 完了！CSVはスクリプトと同じフォルダにあります: {output_csv}")

if __name__ == "__main__":
    scrape_acer_to_csv_realtime()