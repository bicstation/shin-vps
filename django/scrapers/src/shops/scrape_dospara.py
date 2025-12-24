import json
import csv
import os
import sys
from playwright.sync_api import sync_playwright

# パス解決
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
if project_root not in sys.path:
    sys.path.append(project_root)

def scrape_dospara_api():
    output_dir = os.path.join(project_root, "data", "raw")
    os.makedirs(output_dir, exist_ok=True)
    output_csv = os.path.join(output_dir, "dospara_products_api.csv")
    
    target_url = "https://www.dospara.co.jp/TC143"
    captured_data = []

    print(f"🚀 ドスパラの裏側通信を解析中: {target_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 【重要】通信を監視し、JSONデータを含んでいるレスポンスをキャッチする
        def handle_response(response):
            # ドスパラの製品データが含まれるAPIのURLパターン（調査済み）
            if "search" in response.url and "json" in response.url or "/api/" in response.url:
                try:
                    data = response.json()
                    # 階層構造はサイトにより異なりますが、通常は 'items' や 'products' に入っています
                    if isinstance(data, dict):
                        # ここでデータの中身を抽出（ドスパラの構造に合わせる）
                        # ※デバッグ用に取得したJSONのキーを表示
                        items = data.get('data', {}).get('items', [])
                        for item in items:
                            captured_data.append({
                                'name': item.get('name'),
                                'price': item.get('price'),
                                'url': f"https://www.dospara.co.jp/5shopping/detail.php?it={item.get('id')}",
                                'spec': item.get('description', '')
                            })
                except:
                    pass

        page.on("response", handle_response)

        try:
            # ページにアクセスして、APIが叩かれるのを待つ
            page.goto(target_url, wait_until="networkidle", timeout=60000)
            # スクロールして追加読み込みを発生させる
            page.mouse.wheel(0, 2000)
            page.wait_for_timeout(5000)

            # 万が一APIキャッチに失敗した場合の予備策（JavaScriptから直接変数を抜く）
            if not captured_data:
                print("⚠️ 通信傍受に失敗したため、ページ内のデータオブジェクトを直接抽出します...")
                raw_items = page.evaluate("() => window.__NEXT_DATA__?.props?.pageProps?.products || []")
                for item in raw_items:
                    captured_data.append({
                        'name': item.get('name'),
                        'price': item.get('price'),
                        'url': item.get('url'),
                        'spec': item.get('spec')
                    })

            # CSV書き出し
            if captured_data:
                with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
                    writer = csv.writer(f)
                    writer.writerow(['category', 'name', 'price', 'url', 'description'])
                    for p in captured_data:
                        if p['name']:
                            writer.writerow(['galleria', p['name'], p['price'], p['url'], p['spec']])
                
                print(f"✨ 成功！ {len(captured_data)} 件のデータを裏側から取得しました。")
            else:
                print("❌ データを特定できませんでした。サイトが厳重にプロテクトされています。")

        except Exception as e:
            print(f"❌ エラー発生: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    scrape_dospara_api()