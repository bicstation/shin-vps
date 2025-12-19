from playwright.sync_api import sync_playwright
import time

def test_acer_price_extraction():
    with sync_playwright() as p:
        print("--- 商品ページ解析テストを開始します ---")
        
        # iPhone 14 Pro Max 偽装で「一般のスマホユーザー」を装います
        device = p.devices['iPhone 14 Pro Max']
        browser = p.chromium.launch(headless=True, args=["--disable-http2"])
        
        context = browser.new_context(
            **device,
            locale='ja-JP'
        )
        
        page = context.new_page()
        
        # ターゲットURL（サイトマップにあった商品ページの一つ）
        # もし別のURLを試したければここを書き換えてください
        target_url = "https://store.acer.com/ja-jp/acer-anv15-51-n76y46-4"
        
        print(f"アクセス中: {target_url}")
        
        try:
            # サーバーの応答を待つ（少し長めに設定）
            page.goto(target_url, wait_until="domcontentloaded", timeout=60000)
            
            # 人間が読んでいる時間を演出（3秒待機）
            time.sleep(3)
            
            # --- 情報抽出 ---
            # Acer公式ストアのHTML構造に基づいたセレクタです
            title = page.locator("h1.page-title span").inner_text(timeout=5000)
            # 価格は span.price 内にあることが多い
            price = page.locator("span.price").first.inner_text(timeout=5000)
            
            print("\n" + "="*30)
            print(f"✅ 取得成功！")
            print(f"商品名: {title.strip()}")
            print(f"価  格: {price.strip()}")
            print("="*30)

        except Exception as e:
            print(f"\n❌ エラーが発生しました: {e}")
            # 失敗した時の画面を保存（真っ白か、Akamaiの拒絶画面かを確認するため）
            page.screenshot(path="item_error_debug.png")
            print("エラー画面を 'item_error_debug.png' に保存しました。")
            
        finally:
            browser.close()

if __name__ == "__main__":
    test_acer_price_extraction()