import re
import json
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def run_acer():
    results = []
    targets = [
        {"url": "https://store.acer.com/ja-jp/notebooks", "genre": "laptop"},
        {"url": "https://store.acer.com/ja-jp/monitors", "genre": "monitor"}
    ]

    with sync_playwright() as p:
        # HTTP2エラー回避 & 安定性のための引数
        browser = p.chromium.launch(headless=False, args=["--disable-http2"])
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        # サイト全体のタイムアウト設定を少し長めに
        page = context.new_page()
        page.set_default_timeout(90000) 

        for target in targets:
            current_page = 1
            while True:
                url = f"{target['url']}?p={current_page}"
                print(f"📂 巡回中: {url}")
                
                success = False
                # 💡 失敗しても最大3回までリトライするループ
                for attempt in range(3):
                    try:
                        # ページ読み込み（タイムアウトを90秒に設定）
                        page.goto(url, wait_until="domcontentloaded", timeout=90000)
                        success = True
                        break 
                    except Exception as e:
                        print(f"   ⚠️ 読み込み失敗 (試行 {attempt + 1}/3): {e}")
                        time.sleep(5) # 5秒待ってからリトライ
                
                if not success:
                    print(f"   ❌ 3回リトライしましたが失敗しました。次のステップへ進みます。")
                    # 次のカテゴリへ行くのではなく、ループを抜けて次のターゲットへ
                    break

                try:
                    # 💡 LazyLoad対策：画面を少しずつ下にスクロールして画像を読み込ませる
                    print("   ⌛ 画像を読み込み中...")
                    for _ in range(10):  # スクロール回数を少し増やして確実に
                        page.mouse.wheel(0, 800)
                        time.sleep(0.6)
                    
                    # ページの一番上に戻る（要素取得の安定化）
                    page.evaluate("window.scrollTo(0, 0)")
                    time.sleep(1)

                    # BeautifulSoupで解析
                    soup = BeautifulSoup(page.content(), 'html.parser')
                    products = soup.select(".item.product.product-item")
                    
                    if not products:
                        print("   ✅ このカテゴリの全ページを完了しました")
                        break

                    for product in products:
                        link_tag = product.select_one("a.product-item-link")
                        if not link_tag: continue
                        
                        name = link_tag.get_text(strip=True)
                        desc_tag = product.select_one(".description")
                        description = desc_tag.get_text(" / ", strip=True) if desc_tag else ""
                        
                        # 画像URLの取得
                        img_tag = product.select_one("img.product-image-photo")
                        img_url = ""
                        if img_tag:
                            img_url = img_tag.get('src')
                            # もしまだpixel.jpgならdata-original属性などをチェック
                            if img_url and ("pixel.jpg" in img_url or "data:image" in img_url):
                                img_url = img_tag.get('data-original') or img_tag.get('data-src') or img_url

                        price_tag = product.select_one('.price')
                        price_val = int(re.sub(r'[^\d]', '', price_tag.get_text())) if price_tag else 0
                        
                        results.append({
                            "name": name,
                            "description": description,
                            "url": link_tag['href'].split('?')[0],
                            "image_url": img_url,
                            "price": price_val,
                            "genre": target['genre'],
                            "maker": "Acer"
                        })
                    
                    print(f"   ✅ {current_page}ページ目取得完了 ({len(products)}件 / 累計 {len(results)}件)")
                    
                    # 「次へ」ボタンがあるかチェック
                    if not soup.select_one(".pages a.next"):
                        break
                    current_page += 1

                except Exception as e:
                    print(f"   ❌ データ解析中にエラー発生: {e}")
                    break

        # 結果をJSON保存
        with open("acer_results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        
        print(f"\n✨ すべて完了！合計 {len(results)} 件のデータを保存しました。")
        browser.close()

if __name__ == "__main__":
    run_acer()