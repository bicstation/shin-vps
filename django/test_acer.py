from playwright.sync_api import sync_playwright
from lxml import etree

def fetch_acer_final_attempt():
    with sync_playwright() as p:
        print("--- 究極偽装モード（iPhone/Mobile）で起動中... ---")
        # iPhoneを装うことで、サーバー側のガードを緩める作戦です
        device = p.devices['iPhone 14 Pro Max']
        
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-http2", "--no-sandbox"]
        )
        
        context = browser.new_context(
            **device, # iPhoneの画面サイズ、OS情報を丸ごとコピー
            locale='ja-JP',
            timezone_id='Asia/Tokyo'
        )
        
        page = context.new_page()
        
        url = "https://store.acer.com/ja-jp/media/sitemaps/ja-jp/sitemap.xml"
        print(f"ターゲットに超低速アクセス中: {url}")
        
        try:
            # 待機条件を "commit"（データが少しでも届いたら次に進む）に変更
            # タイムアウトも90秒に延長
            response = page.goto(url, wait_until="commit", timeout=90000)
            
            print(f"HTTPステータス: {response.status if response else 'None'}")
            
            # サーバーが反応するまで10秒じっと待つ（人間が画面を見ているフリ）
            page.wait_for_timeout(10000)
            
            content = page.content()
            
            if len(content) < 1000:
                print(f"❌ コンテンツ不足 ({len(content)} bytes)")
                page.screenshot(path="debug_final_timeout.png")
            else:
                print("✅ ついに突破！？解析します...")
                root = etree.fromstring(content.encode('utf-8'))
                namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
                urls = root.xpath('//ns:loc/text()', namespaces=namespaces)
                print(f"🎉 成功！ {len(urls)} 件のURLを検出。")

        except Exception as e:
            print(f"❌ 最終エラー: {e}")
            page.screenshot(path="debug_last_resort.png")
        finally:
            browser.close()

if __name__ == "__main__":
    fetch_acer_final_attempt()