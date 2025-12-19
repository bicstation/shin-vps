from playwright.sync_api import sync_playwright
from lxml import etree

def fetch_acer_with_browser():
    with sync_playwright() as p:
        print("ブラウザを起動中...")
        browser = p.chromium.launch(headless=True)
        
        # 人間に見せかけるためのコンテキスト設定
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800}
        )
        
        page = context.new_page()
        
        url = "https://store.acer.com/ja-jp/media/sitemaps/ja-jp/sitemap.xml"
        print(f"アクセス中: {url}")
        
        try:
            # ページ読み込み（ネットワークが落ち着くまで待機）
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            # ページのコンテンツを取得
            content = page.content()
            
            # XMLとして解析
            root = etree.fromstring(content.encode('utf-8'))
            namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
            urls = root.xpath('//ns:loc/text()', namespaces=namespaces)
            
            print(f"\n--- 成功！ {len(urls)} 件のURLを検出 ---")
            for i, loc in enumerate(urls[:10], 1):
                print(f"{i}: {loc}")
                
        except Exception as e:
            print(f"エラー発生: {e}")
            # エラー時のスクリーンショット（デバッグ用知見）
            page.screenshot(path="error_debug.png")
            print("デバッグ用スクリーンショットを保存しました。")
            
        finally:
            browser.close()

if __name__ == "__main__":
    fetch_acer_with_browser()