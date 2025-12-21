import csv
import os
import subprocess
from bs4 import BeautifulSoup

def run_docker_import_sycom(csv_path):
    container_name = "api_django_v2"
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    print(f"🚀 Dockerコンテナへデータを転送・DB更新中...")
    try:
        subprocess.run(["docker", "cp", csv_path, f"{container_name}:/usr/src/app/scrapers/sycom_products.csv"], check=True)
        # 指定された docker-compose.stg.yml を使用して実行
        import_cmd = [
            "docker", "compose", "-f", "docker-compose.stg.yml", 
            "exec", "django-v2", 
            "python", "manage.py", "import_sycom"
        ]
        subprocess.run(import_cmd, check=True, cwd=project_root)
        print(f"✅ Djangoインポート完了！")
    except Exception as e:
        print(f"❌ Docker連携エラー: {e}")

def scrape_sycom_from_html_source():
    # ブラウザから保存したHTMLファイル
    input_file = os.path.join(os.path.dirname(__file__), "sycom_data.txt")
    output_csv = os.path.join(os.path.dirname(__file__), "sycom_products.csv")
    
    if not os.path.exists(input_file):
        print(f"❌ {input_file} が見つかりません。")
        print("ブラウザでソースを表示し、sycom_page.html という名前で保存してください。")
        return

    print(f"📖 {input_file} を解析中...")
    with open(input_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    all_data = []

    # 💡 共有いただいたHTML構造に基づき、各商品アイテム(div.item)をループ
    items = soup.find_all("div", class_="item")
    
    for item in items:
        # 1. 商品名を取得 (<p class="name01">)
        name_tag = item.find("p", class_="name01")
        # 2. 価格を取得 (<span id="model_xxxxxx">)
        price_tag = item.find("span", id=lambda x: x and x.startswith('model_'))
        # 3. カスタマイズURLを取得
        link_tag = item.find("a", href=True)

        if name_tag and price_tag:
            name = name_tag.get_text(strip=True)
            # カンマを除去して数値化
            price_text = price_tag.get_text(strip=True).replace(",", "")
            price = int(price_text)
            
            url = link_tag["href"]
            if not url.startswith("http"):
                url = "https://www.sycom.co.jp" + url

            all_data.append(["Desktop", f"[Sycom] {name}", price, url, "", ""])
            print(f"   ✅ 抽出成功: {name} | {price}円")

    if all_data:
        # 重複削除
        unique_data = {d[1]: d for d in all_data}.values()
        with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])
            writer.writerows(unique_data)
        
        print(f"✨ 合計 {len(unique_data)} 件を抽出しました。")
        run_docker_import_sycom(output_csv)
    else:
        print("❌ 商品情報を特定できませんでした。HTMLの保存形式（Ctrl+S）を確認してください。")

if __name__ == "__main__":
    scrape_sycom_from_html_source()