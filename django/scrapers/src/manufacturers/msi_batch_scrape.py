import time
import csv
import random
import os
import subprocess
from playwright.sync_api import sync_playwright

# --- 判定ロジック関数 (いじっていません) ---
def get_category_from_name(name):
    """商品名に含まれるキーワードからカテゴリを極限まで詳細に判定する"""
    n = name.upper()
    
    # 1. マザーボード
    mb_keywords = [
        "B860", "B850", "X870", "Z890", "Z790", "B760", "B650", "X670", "B550", "A620",
        "MORTAR", "TOMAHAWK", "CARBON", "WIFI", "PRO B", "PRO Z", "PRO H", "PRO A", "BAZOOKA", 
        "GODLIKE", "ACE", "UNIFY", "GAMING PLUS", "PRO-VDH", "H370", "B360", "H270", "Z370",
        "背面コネクタ対応"
    ]
    if any(k in n for k in mb_keywords):
        return "Motherboard"
    
    # 2. 電源 (PSU)
    psu_keywords = [
        "電源", "UNIT", "PSU", "A850", "A750", "A650", "A1000", "A1250", "GL", "GS", "BNL", "PCIE5", "GOLD"
    ]
    if any(k in n for k in psu_keywords) and ("W" in n or any(d in n for d in ["550", "650", "750", "850", "1000"])):
        return "PSU"

    # 3. モニター
    monitor_keywords = [
        "インチ", "ゲーミングモニター", "HZ", "DISPLAY", "液晶", "モニター", "QD-OLED", "湾曲", "G24", "G27", "G32"
    ]
    if any(k in n for k in monitor_keywords) and not any(k in n for k in ["ノート", "SUMMIT", "CLAW"]):
        return "Monitor"

    # 4. ノートPC
    notebook_keywords = [
        "ノート", "STEALTH", "CYBORG", "PRESTIGE", "KATANA", "RAIDER", "VECTOR", "SUMMIT", "MODERN", "CLAW"
    ]
    if any(k in n for k in notebook_keywords):
        return "Notebook"

    # 5. 周辺機器
    peripheral_keywords = [
        "マウス", "キーボード", "ヘッドセット", "CLUTCH", "VIGOR", "VERSA", "GK30", "GK320", "CONTROLLER", "MOUSE"
    ]
    if any(k in n for k in peripheral_keywords):
        return "Peripheral"

    # 6. クーラー・ファン
    cooler_keywords = [
        "LIQUID", "水冷", "クーラー", "CORELIQUID", "COREFROZR", "SILENT GALE", "P12", "F12"
    ]
    if any(k in n for k in cooler_keywords):
        return "Cooler"

    # 7. ケース
    case_keywords = [
        "FORGE", "VELOX", "PANO", "CASE", "GUNGNIR", "PROSPECT", "ケース", "CHASSIS"
    ]
    if any(k in n for k in case_keywords):
        return "Case"

    # 8. ビデオカード
    gpu_keywords = [
        "GEFORCE", "RTX", "GTX", "VENTUS", "SUPRIM", "GT 710", "GT 1030", "GRAPHICS CARD", "AERO ITX"
    ]
    if any(k in n for k in gpu_keywords):
        return "Graphics Card"

    return "Other"

# --- 💡 新設: Dockerへの自動反映ロジック ---
def run_docker_import_msi(csv_path):
    """
    スクレイピング完了後、自動でファイルをコピーし、
    DjangoのMSIインポートコマンドを実行する
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # プロジェクトルートへ遡る
    project_root = os.path.abspath(os.path.join(base_dir, "..", ".."))
    
    container_name = "api_django_v2" 
    container_csv_path = "/usr/src/app/scrapers/tsukumo_msi_products.csv"

    print("\n" + "="*40)
    print("🔄 データベースへの自動反映を開始します（MSI）")
    print("="*40)
    
    try:
        # 1. docker cp でコンテナにファイルを送る
        copy_cmd = ["docker", "cp", csv_path, f"{container_name}:{container_csv_path}"]
        subprocess.run(copy_cmd, check=True)
        print(f"📂 [Step 1/2] 最新CSVをコンテナへコピーしました。")

        # 2. docker compose exec で Djangoコマンドを実行
        import_cmd = [
            "docker", "compose", "-f", "docker-compose.stg.yml",
            "exec", "django-v2", "python", "manage.py", "import_tsukumo_msi"
        ]
        
        result = subprocess.run(
            import_cmd, 
            check=True, 
            text=True, 
            capture_output=True, 
            cwd=project_root,
            encoding='utf-8'
        )
        
        print(f"🚀 [Step 2/2] Djangoインポート処理が成功しました。")
        print("-" * 40)
        print(f"📋 Djangoからの報告:\n{result.stdout.strip()}")
        print("-" * 40)

    except subprocess.CalledProcessError as e:
        print(f"❌ エラーが発生しました:\n{e.stderr}")
    except Exception as e:
        print(f"⚠️ 予期せぬエラー: {e}")

# --- メインスクレイピング関数 (判定ロジックを活かしたまま構造維持) ---
def scrape_tsukumo_msi():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv = os.path.join(base_dir, "tsukumo_msi_products.csv")

    with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'name', 'price', 'url', 'image_url'])

    base_url_template = "https://shop.tsukumo.co.jp/search/p{}/?maker_id[]=7089&end_of_sales=1&keyword=MSI"
    all_processed_urls = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False) 
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        page_num = 1
        while True:
            url = base_url_template.format(page_num)
            print(f"📄 ページ {page_num} を最終スキャン中...")
            
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                page.mouse.wheel(0, 1500)
                page.wait_for_timeout(3000)

                links = page.query_selector_all("a[href*='/goods/']")
                if not links: break

                new_items_in_page = 0
                for link in links:
                    try:
                        href = link.get_attribute("href")
                        if not href: continue
                        full_url = "https://shop.tsukumo.co.jp" + href if href.startswith("/") else href
                        if full_url in all_processed_urls: continue

                        parent = link.evaluate_handle("el => el.closest('li') || el.closest('.item') || el.parentElement.parentElement")
                        
                        raw_name = link.inner_text().strip().split('\n')[-1]
                        if not raw_name or len(raw_name) < 5: continue
                        display_name = raw_name if raw_name.startswith("MSI") else f"MSI {raw_name}"

                        # カテゴリ判定
                        category = get_category_from_name(display_name)

                        # 価格取得
                        price_el = parent.query_selector(".product-list__price-main, [class*='price'], b")
                        price = 0
                        if price_el:
                            price_val = "".join(filter(str.isdigit, price_el.inner_text()))
                            price = int(price_val) if price_val else 0

                        # 画像取得
                        img_el = parent.query_selector("img")
                        image_url = img_el.get_attribute("src") if img_el else ""

                        with open(output_csv, 'a', newline='', encoding='utf-8-sig') as f:
                            writer = csv.writer(f)
                            writer.writerow([category, display_name, price, full_url, image_url])

                        all_processed_urls.add(full_url)
                        new_items_in_page += 1
                    except:
                        continue

                print(f"✅ ページ {page_num} 完了（累計: {len(all_processed_urls)}件）")
                if new_items_in_page == 0: break
                page_num += 1
                time.sleep(random.uniform(1, 2))

            except Exception as e:
                print(f"⚠️ エラー: {e}")
                break

        browser.close()
    
    print(f"✨ スクレイピング完了！ CSV: {output_csv}")
    
    # 💡 最後にDockerへの反映処理を実行
    run_docker_import_msi(output_csv)

if __name__ == "__main__":
    scrape_tsukumo_msi()