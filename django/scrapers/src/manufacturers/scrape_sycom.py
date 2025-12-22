# サイコムはHTMLの生データをコピペしてテキストに貼り付けてデータをゲットします


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
    input_file = os.path.join(os.path.dirname(__file__), "sycom_data.txt")
    output_csv = os.path.join(os.path.dirname(__file__), "sycom_products.csv")
    
    if not os.path.exists(input_file):
        print(f"❌ {input_file} が見つかりません。")
        return

    print(f"📖 {input_file} を解析中...")
    with open(input_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    all_data = []
    items = soup.find_all("div", class_="item")
    
    for item in items:
        # 1. 商品名
        name_tag = item.find("p", class_="name01")
        # 2. 価格
        price_tag = item.find("span", id=lambda x: x and x.startswith('model_'))
        # 3. URL
        link_tag = item.find("a", href=True)
        # 4. 画像URL (imgタグのsrcを取得)
        img_tag = item.find("img")
        # 5. スペック詳細 (p.spec や div.spec_box などのテキストを収集)
        # サイコムの構造に合わせ、複数のスペックテキストを取得して「 / 」で結合
        spec_tags = item.find_all("p", class_="spec") # もし spec クラスに詳細がある場合
        if not spec_tags:
            # specクラスがない場合は、item内のテキスト情報を探る
            spec_text = item.get_text(" / ", strip=True) 
        else:
            spec_text = " / ".join([s.get_text(strip=True) for s in spec_tags])

        if name_tag and price_tag:
            name = name_tag.get_text(strip=True)
            price_text = price_tag.get_text(strip=True).replace(",", "")
            price = int(price_text)
            
            url = link_tag["href"]
            if not url.startswith("http"):
                url = "https://www.sycom.co.jp" + url

            image_url = ""
            if img_tag and img_tag.get("src"):
                image_url = img_tag["src"]
                if not image_url.startswith("http"):
                    image_url = "https://www.sycom.co.jp/" + image_url.lstrip("/")

            # descriptionにスペックを入れる
            description = spec_text

            all_data.append(["Desktop", f"[Sycom] {name}", price, url, image_url, description])
            print(f"   ✅ 抽出成功: {name} | {price}円")

    if all_data:
        # 名前をキーにして重複削除
        unique_data = {d[1]: d for d in all_data}.values()
        with open(output_csv, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['category', 'name', 'price', 'url', 'image_url', 'description'])
            writer.writerows(unique_data)
        
        print(f"✨ 合計 {len(unique_data)} 件を抽出しました。")
        run_docker_import_sycom(output_csv)
    else:
        print("❌ 商品情報を特定できませんでした。")

if __name__ == "__main__":
    scrape_sycom_from_html_source()