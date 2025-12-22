import time
import csv
import random
import os
import subprocess
import re
from playwright.sync_api import sync_playwright

def run_docker_import(csv_path):
    """
    スクレイピング完了後、自動でファイルをコピーし、
    Djangoのインポートコマンドを実行する
    """
    container_name = "api_django_v2"
    container_csv_path = "/usr/src/app/scrapers/acer_products_final.csv"

    print("\n" + "="*40)
    print("🔄 データベースへの自動反映を開始します")
    print("="*40)
    
    try:
        # 1. コンテナ内にディレクトリがない場合に備えて作成
        subprocess.run(["docker", "exec", container_name, "mkdir", "-p", "/usr/src/app/scrapers"], check=True)

        # 2. docker cp でコンテナにファイルを送る
        copy_cmd = ["docker", "cp", csv_path, f"{container_name}:{container_csv_path}"]
        subprocess.run(copy_cmd, check=True)
        print(f"📂 [Step 1/2] CSVファイルをコンテナ({container_name})内にコピーしました。")

        # 3. Djangoのインポートコマンドを実行
        import_cmd = [
            "docker", "exec", 
            container_name, 
            "python", "manage.py", "import_acer"
        ]
        
        print(f"🚀 [Step 2/2] インポート処理を実行中...")
        result = subprocess.run(
            import_cmd, 
            check=True, 
            text=True, 
            capture_output=True,
            encoding='utf-8'
        )
        
        print("-" * 40)
        print(f"📋 Djangoからの報告:\n{result.stdout.strip()}")
        print("-" * 40)
        print("\n✨ すべての工程が正常に終了しました。")

    except subprocess.CalledProcessError as e:
        print(f"❌ Dockerコマンド実行中にエラーが発生しました:\n{e.stderr or e.stdout}")
    except Exception as e:
        print(f"⚠️ 予期せぬエラーが発生しました: {e}")

def scrape_acer_to_csv_realtime():
    # 保存パスの設定
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv = os.path.join(base_dir, "acer_products_final.csv")
    
    targets = [
        {"category": "laptop", "url": "https://store.acer.com/ja-jp/notebooks?p="},
        {"category": "monitor", "url": "https://store.acer.com/ja-jp/monitors?p="},
        {"category": "desktop", "url": "https://store.acer.com/ja-jp/desktops?p="},
        {"category": "peripheral", "url": "https://store.acer.com/ja-jp/peripheral?p="},
    ]
    
    total_count = 0

    # CSVの初期化
    with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])

    with sync_playwright() as p:
        # ブラウザの起動（ステルス設定）
        browser = p.chromium.launch(
            headless=True, 
            args=[
                '--disable-http2',
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-position=0,0',
                '--ignore-certificate-errors',
            ]
        )
        
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            locale="ja-JP",
            timezone_id="Asia/Tokyo",
            extra_http_headers={
                "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            }   
        )
        
        page = context.new_page()
        # webdriverフラグを隠す
        page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        for target in targets:
            category_name = target["category"]
            base_url = target["url"]
            last_page_data = set()
            page_num = 1
            
            print(f"\n🚀 {category_name} の取得を開始します...")

            while True:
                # URLをここで定義（UnboundLocalErrorを防止）
                current_url = f"{base_url}{page_num}"
                print(f"📄 [{category_name}] ページ {page_num} を読み込み中...")
                
                try:
                    # タイムアウト対策：domcontentloadedで進める
                    page.goto(current_url, wait_until="domcontentloaded", timeout=60000)
                    
                    # 人間らしいランダムな待機
                    page.wait_for_timeout(random.uniform(3000, 5000))

                    # 商品リストが表示されるかチェック
                    try:
                        page.wait_for_selector(".product-item-info", state="attached", timeout=15000)
                    except:
                        print(f"🏁 {category_name} の全ページを終了しました（または商品が見つかりません）。")
                        break

                    # 遅延読み込み対策のスクロール
                    for _ in range(5):
                        page.evaluate("window.scrollBy(0, 800)")
                        time.sleep(0.4)
                    
                    items = page.query_selector_all(".product-item-info")
                    current_page_names = []

                    for item in items:
                        try:
                            name_el = item.query_selector(".product-item-name a")
                            price_el = item.query_selector("span.price")
                            
                            if name_el and price_el:
                                name = name_el.inner_text().strip()
                                item_url = name_el.get_attribute("href") or ""
                                
                                # 画像取得（srcまたはdata-src）
                                img_el = item.query_selector(".product-image-photo")
                                image_url = ""
                                if img_el:
                                    image_url = img_el.get_attribute("src") or img_el.get_attribute("data-src") or ""
                                
                                # プレースホルダー画像はスキップ
                                if not image_url or "pixel.jpg" in image_url:
                                    continue

                                # 価格の数値化
                                price_text = price_el.inner_text()
                                price = int(re.sub(r'\D', '', price_text))
                                
                                # 説明文の整形
                                desc_el = item.query_selector(".product-item-details .description") or item.query_selector(".product-item-details")
                                description = desc_el.inner_text().replace('\n', ' / ').strip() if desc_el else ""

                                current_page_names.append(name)

                                # CSVへ追記保存
                                with open(output_csv, 'a', newline='', encoding='utf-8-sig') as f:
                                    writer = csv.writer(f)
                                    writer.writerow([category_name, name, price, item_url, image_url, description])
                                
                                total_count += 1
                        except Exception:
                            continue
                    
                    # 同一内容のページ（無限ループ防止）のチェック
                    current_page_set = set(current_page_names)
                    if not current_page_names or (last_page_data and current_page_set.issubset(last_page_data)):
                        print(f"📊 重複または空ページのため、{category_name} を終了します。")
                        break

                    last_page_data = current_page_set
                    print(f"✅ {category_name} ページ {page_num} 完了（累計: {total_count}件）")
                    
                    page_num += 1

                except Exception as e:
                    print(f"⚠️ ページ遷移エラー: {e}")
                    # エラー時はデバッグ用にスクリーンショットを撮ると役立ちます
                    # page.screenshot(path=f"error_page_{page_num}.png")
                    break

        browser.close()
    
    print(f"\n✨ スクレイピング完了！累計取得件数: {total_count}")
    
    if total_count > 0:
        run_docker_import(output_csv)
    else:
        print("⚠️ データが取得できなかったため、インポートは実行しません。")

if __name__ == "__main__":
    scrape_acer_to_csv_realtime()