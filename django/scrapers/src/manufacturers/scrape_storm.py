import time
import csv
import random
import os
import subprocess
import requests
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

def get_product_urls_from_sitemap():
    sitemap_url = "https://www.stormst.com/sitemap_product_1.xml"
    print(f"🔍 サイトマップから最新の商品リストを取得中...")
    try:
        response = requests.get(sitemap_url)
        root = ET.fromstring(response.content)
        urls = [loc.text for loc in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        print(f"✅ {len(urls)}件の商品URLを発見しました。")
        return urls
    except Exception as e:
        print(f"❌ サイトマップ解析失敗: {e}")
        return []

def run_docker_import_storm(csv_path):
    """
    生成されたCSVをDockerコンテナにコピーし、Djangoのインポートコマンドを実行する
    """
    container_name = "api_django_v2"  # コンテナ名
    # コンテナ内の保存先パス（適宜プロジェクトの構成に合わせて調整してください）
    container_csv_path = "/usr/src/app/scrapers/storm_products.csv"
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    print(f"🚀 Dockerコンテナ '{container_name}' へデータをコピー中...")
    try:
        # 1. CSVファイルをコンテナにコピー (docker cp)
        subprocess.run(["docker", "cp", csv_path, f"{container_name}:{container_csv_path}"], check=True)
        print(f"✅ ファイルコピー完了: {container_csv_path}")

        # 2. Djangoのインポートマネジメントコマンドを実行
        # ※ docker-compose exec を使用する例
        print(f"⚙️  Djangoインポートコマンドを実行中...")
        import_cmd = [
            "docker", "compose", "-f", "docker-compose.stg.yml", 
            "exec", "django-v2", 
            "python", "manage.py", "import_storm"
        ]
        
        result = subprocess.run(
            import_cmd, 
            check=True, 
            text=True, 
            capture_output=True, 
            cwd=project_root, 
            encoding='utf-8'
        )
        print(f"💡 Django報告:\n{result.stdout.strip()}")

    except subprocess.CalledProcessError as e:
        print(f"❌ Docker操作エラー: {e}")
        if e.stderr:
            print(f"エラー詳細: {e.stderr}")
    except Exception as e:
        print(f"❌ 予期せぬエラー: {e}")

def scrape_storm():
    urls = get_product_urls_from_sitemap()
    if not urls: return

    # 実行ファイルと同じディレクトリにCSVを出力
    output_csv = os.path.join(os.path.dirname(__file__), "storm_products.csv")
    
    # ヘッダーの初期化
    with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0")
        page = context.new_page()

        success_count = 0
        for i, url in enumerate(urls, 1):
            try:
                print(f"📦 [{i}/{len(urls)}] 解析中: {url}")
                page.goto(url, wait_until="domcontentloaded", timeout=60000)

                # meta情報の抽出
                meta_data = page.evaluate("""() => {
                    const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content');
                    return {
                        name: getMeta('og:title'),
                        price: getMeta('product:price:amount'),
                        image: getMeta('og:image')
                    };
                }""")

                # 商品名の加工 ([STORM] を付与)
                raw_name = meta_data['name'] or "Unknown Name"
                name = f"[STORM] {raw_name}"
                
                price = int(meta_data['price']) if meta_data['price'] and meta_data['price'].isdigit() else 0
                image_url = meta_data['image'] or ""

                # スペック情報はbodyから取得
                desc_el = page.query_selector(".ec-productRole__description")
                description = ""
                if desc_el:
                    description = " / ".join([l.strip() for l in desc_el.inner_text().splitlines() if l.strip()])

                # カテゴリ判定
                category = "Notebook" if "ノート" in raw_name or "Laptop" in raw_name else "Desktop"

                # CSVへ追記
                with open(output_csv, 'a', newline='', encoding='utf-8-sig') as f:
                    writer = csv.writer(f)
                    writer.writerow([category, name, price, url, image_url, description])
                
                success_count += 1
                time.sleep(random.uniform(0.3, 0.8))

            except Exception as e:
                print(f"⚠️ スキップ ({url}): {e}")
                continue

        browser.close()
    
    print(f"\n✨ スクレイピング完了！ (成功: {success_count}/{len(urls)} 件)")
    
    # 全件取得完了後にDockerへコピー & インポート
    run_docker_import_storm(output_csv)

if __name__ == "__main__":
    scrape_storm()