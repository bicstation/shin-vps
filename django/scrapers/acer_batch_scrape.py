import time
import csv
import random
import os
import subprocess # 💡 追加
from playwright.sync_api import sync_playwright

def run_docker_import(csv_path):
    """
    スクレイピング完了後、自動でファイルをコピーし、
    Djangoのインポートコマンドを実行する
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, "..", ".."))
    
    # 設定情報
    container_name = "api_django_v2"
    container_csv_path = "/usr/src/app/acer_detailed_final.csv"

    print("\n" + "="*40)
    print("🔄 データベースへの自動反映を開始します")
    print("="*40)
    
    try:
        # 1. docker cp でコンテナにファイルを送る
        copy_cmd = ["docker", "cp", csv_path, f"{container_name}:{container_csv_path}"]
        subprocess.run(copy_cmd, check=True)
        
        # 💡 ここにメッセージを追加しました
        print(f"📂 [Step 1/2] Windows側のCSVファイルを Dockerコンテナ({container_name}) のシェル内にコピーしました。")

        # 2. docker compose exec でインポートを実行
        import_cmd = [
            "docker", "compose", "-f", "docker-compose.stg.yml",
            "exec", "django-v2", "python", "manage.py", "import_acer"
        ]
        
        result = subprocess.run(
            import_cmd, 
            check=True, 
            text=True, 
            capture_output=True, 
            cwd=project_root,
            encoding='utf-8'
        )
        
        # 💡 インポート完了のメッセージ
        print(f"🚀 [Step 2/2] Dockerシェル内でのインポート処理が成功しました。")
        print("-" * 40)
        print(f"📋 Djangoからの報告:\n{result.stdout.strip()}")
        print("-" * 40)
        print("\n✨ すべての工程が正常に終了しました。")

    except subprocess.CalledProcessError as e:
        print(f"❌ Dockerコマンド実行中にエラーが発生しました:\n{e.stderr}")
    except Exception as e:
        print(f"⚠️ 予期せぬエラーが発生しました: {e}")

# (これより上の scrape_acer_to_csv_realtime 関数などは変更なし)

def scrape_acer_to_csv_realtime():
    # 1. 保存パスをスクリプトと同じフォルダに固定
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv = os.path.join(base_dir, "acer_products_final.csv")
    
    # 💡 巡回するターゲットURLのリスト（カテゴリ名とベースURLのペア）
    targets = [
        {"category": "Notebook", "url": "https://store.acer.com/ja-jp/notebooks?p="},
        {"category": "Monitor", "url": "https://store.acer.com/ja-jp/monitors?p="},
        {"category": "Desktops", "url": "https://store.acer.com/ja-jp/desktops?p="},
        {"category": "Peripheral", "url": "https://store.acer.com/ja-jp/peripheral?p="},
    ]
    
    total_count = 0

    # CSVを新規作成してヘッダーを書き込む（categoryを追加）
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])

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

        for target in targets:
            category_name = target["category"]
            base_url = target["url"]
            last_page_data = set()
            page_num = 1
            
            print(f"\n🚀 {category_name} の取得を開始します...")

            while True:
                current_url = f"{base_url}{page_num}"
                print(f"📄 [{category_name}] ページ {page_num} を読み込み中...")
                
                try:
                    page.goto(current_url, wait_until="commit", timeout=90000)
                    page.wait_for_timeout(5000) # サイトの重さ対策

                    # 商品リストが表示されるまで待機
                    try:
                        page.wait_for_selector(".product-item-info", state="attached", timeout=15000)
                    except:
                        print(f"🏁 {category_name} の全ページを終了しました。")
                        break

                    # LazyLoad対策スクロール
                    for _ in range(8):
                        page.evaluate("window.scrollBy(0, 700)")
                        time.sleep(0.4)
                    
                    page.wait_for_timeout(2000)
                    items = page.query_selector_all(".product-item-info")
                    current_page_names = []

                    for item in items:
                        try:
                            name_el = item.query_selector(".product-item-name a")
                            price_el = item.query_selector("span.price")
                            
                            if name_el and price_el:
                                name = name_el.inner_text().strip()
                                item_url = name_el.get_attribute("href") or ""
                                
                                # 画像取得
                                img_el = item.query_selector(".product-image-photo")
                                image_url = ""
                                if img_el:
                                    img_el.scroll_into_view_if_needed()
                                    for attr in ["data-src", "src", "data-original"]:
                                        candidate = img_el.get_attribute(attr)
                                        if candidate and "pixel.jpg" not in candidate and candidate.startswith("http"):
                                            image_url = candidate
                                            break
                                
                                if not image_url:
                                    continue

                                # 価格と説明
                                price_text = price_el.inner_text()
                                price = int(price_text.replace('¥', '').replace(',', '').replace(' ', '').replace('　', ''))
                                desc_el = item.query_selector(".product-item-details .description") or item.query_selector(".product-item-details")
                                description = desc_el.inner_text().replace('\n', ' / ').strip() if desc_el else ""

                                current_page_names.append(name)

                                # 1件ずつCSVへ追記
                                with open(output_csv, 'a', newline='', encoding='utf-8') as f:
                                    writer = csv.writer(f)
                                    writer.writerow([category_name, name, price, item_url, image_url, description])
                                
                                total_count += 1
                        except:
                            continue
                    
                    # 重複チェック
                    current_page_set = set(current_page_names)
                    if not current_page_names or (last_page_data and current_page_set.issubset(last_page_data)):
                        print(f"🏁 {category_name} の重複を検知したため次のカテゴリへ。")
                        break

                    last_page_data = current_page_set
                    print(f"✅ {category_name} ページ {page_num} 完了（累計: {total_count}件）")
                    
                    page_num += 1
                    time.sleep(random.uniform(3.0, 5.0))

                except Exception as e:
                    print(f"⚠️ エラー発生: {e}")
                    break

        browser.close()
    
    print(f"\n✨ スクレイピング完了！CSVファイル: {output_csv}")
    
    # 💡 ここでインポート関数を呼び出す
    run_docker_import(output_csv)

if __name__ == "__main__":
    scrape_acer_to_csv_realtime()