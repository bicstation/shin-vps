import re
import json
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def run_ark():
    results = []
    base_url = "https://www.ark-pc.co.jp/search/?key=MSI"

    with sync_playwright() as p:
        # headless=False でブラウザの動きを監視
        browser = p.chromium.launch(headless=False, slow_mo=200)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 1200}
        )
        page = context.new_page()

        current_offset = 0
        while True:
            url = f"{base_url}&offset={current_offset}"
            print(f"📂 アーク巡回中: {url}")
            
            try:
                # ページへ移動（networkidleで通信が止まるまで待つ）
                page.goto(url, wait_until="networkidle", timeout=60000)
                
                # 💡 対策1: 画面をゆっくりスクロールして動的コンテンツを強制ロード
                for _ in range(3):
                    page.mouse.wheel(0, 800)
                    time.sleep(1)

                # 💡 対策2: 商品ボックスの候補を複数待機
                # .item_box がダメな場合、a.overlink や .item_name を探す
                selectors = [".item_box", ".item_name", "div[id*='item']", ".product-list"]
                found_selector = None
                for selector in selectors:
                    try:
                        page.wait_for_selector(selector, timeout=5000)
                        found_selector = selector
                        break
                    except:
                        continue

                if not found_selector:
                    print(f"   ⚠️ 商品リストの読み込みを確認できませんでした。")
                    # デバッグ用にその時のHTMLを一部表示
                    break

                # 💡 対策3: 最新のDOM状態を取得
                content = page.content()
                soup = BeautifulSoup(content, 'html.parser')
                
                # 商品リストの取得
                products = soup.select(".item_box")
                
                # もし .item_box で取れない場合、親要素から辿る
                if not products:
                    products = soup.find_all("div", class_=re.compile("item.*box"))

                if not products:
                    print("   ✅ 取得可能な商品がなくなりました。")
                    break

                for product in products:
                    # 商品名
                    name_tag = product.select_one(".item_name a") or product.select_one("a[href*='detail']")
                    if not name_tag: continue
                    name = name_tag.get_text(strip=True)
                    
                    # URL
                    href = name_tag.get('href', '')
                    full_url = f"https://www.ark-pc.co.jp{href}" if href.startswith('/') else href

                    # 画像
                    img_tag = product.select_one(".item_image img") or product.find("img")
                    img_url = ""
                    if img_tag:
                        img_url = img_tag.get('src', '') or img_tag.get('data-src', '')
                        if img_url and not img_url.startswith('http'):
                            img_url = f"https://www.ark-pc.co.jp{img_url}"

                    # 価格
                    price_tag = product.select_one(".item_price") or product.select_one(".price")
                    price_val = 0
                    if price_tag:
                        digits = re.sub(r'[^\d]', '', price_tag.get_text())
                        price_val = int(digits) if digits else 0

                    # スペック
                    desc_tag = product.select_one(".item_description")
                    description = desc_tag.get_text(strip=True) if desc_tag else ""

                    results.append({
                        "name": name,
                        "description": description,
                        "url": full_url,
                        "image_url": img_url,
                        "price": price_val,
                        "genre": "pc",
                        "maker": "MSI"
                    })
                
                print(f"   ✅ Offset {current_offset} 完了 ({len(products)}件 / 累計 {len(results)}件)")
                
                if len(products) < 10: # アークは15件だが、余裕を見て10件未満で終了
                    break
                
                current_offset += 15
                time.sleep(3) # 人間らしい待機時間

            except Exception as e:
                print(f"   ❌ エラー発生: {e}")
                break

        with open("ark_msi_results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        
        print(f"\n🚀 合計 {len(results)} 件のデータを保存しました。")
        browser.close()

if __name__ == "__main__":
    run_ark()