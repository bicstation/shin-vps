import asyncio
from playwright.async_api import async_playwright
import csv

async def scrape_all_msi():
    async with async_playwright() as p:
        # headless=False にしてブラウザの動きが見えるようにします
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        all_products = []
        page_num = 1
        
        while True:
            # ご提示いただいたURL形式に従い、p1, p2, p3... と進みます
            url = f"https://shop.tsukumo.co.jp/search/p{page_num}/?end_of_sales=1&keyword=MSI"
            print(f"📄 {page_num}ページ目をスキャン中: {url}")
            
            try:
                # ページ遷移。タイムアウトを避けるため少し長めに設定
                response = await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # ページが存在しない、または読み込み失敗時の終了判定
                if not response or response.status == 404:
                    print("🏁 ページが見つかりません。完了と判断します。")
                    break

                # 💡 ツクモの動的な商品リストが表示されるのをしっかり待機
                await page.wait_for_timeout(5000)

                # ターゲットフレーム（検索結果が表示されているiframe）を特定
                target = page
                for frame in page.frames:
                    if "shop.tsukumo.co.jp" in frame.url and "search" in frame.url:
                        target = frame
                        print(f"🎯 ターゲットフレーム内で実行します")
                        break

                # 🖼️ スクロールして画像と価格の読み込み（Lazy Load対策）を促す
                await target.evaluate("window.scrollBy(0, 2000)")
                await asyncio.sleep(2)

                # 💡 抽出ロジック：商品の「箱」単位で情報を集める
                page_products = await target.evaluate('''() => {
                    const results = [];
                    const seen = new Set();
                    
                    // 商品の親要素（liやdiv）を取得
                    const items = Array.from(document.querySelectorAll('li.product-list__item, .product-list__content, .item'));

                    items.forEach(item => {
                        const a = item.querySelector('a[href*="/goods/"]');
                        if (!a) return;

                        const url = a.href;
                        const nameRaw = a.innerText.trim();
                        // 重複やゴミ情報の除外
                        if (seen.has(url) || nameRaw.length < 10 || /背面|詳細|こちら|カート/.test(nameRaw)) return;
                        seen.add(url);

                        // 💰 価格取得の強化：専用クラスから抜き出し、なければテキスト全体から正規表現で
                        let price = "0";
                        const priceEl = item.querySelector('.product-list__price-main, .price-main, .price, .item_price');
                        
                        if (priceEl) {
                            // 数字だけを抽出
                            const pText = priceEl.innerText.replace(/[^0-9]/g, "");
                            if (pText) price = pText;
                        } else {
                            // クラスがない場合は「〇〇円」というテキストを検索
                            const fullText = item.innerText.replace(/,/g, "");
                            const match = fullText.match(/([0-9]{3,})円/);
                            if (match) price = match[1];
                        }

                        // 🖼️ 画像URL取得
                        const img = item.querySelector('img');
                        let image_url = "";
                        if (img) {
                            image_url = img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || "";
                        }

                        // 🏷️ カテゴリ判定（現行＆過去モデルのキーワードを網羅）
                        const n = nameRaw.toUpperCase();
                        let category = "Other";
                        if (/B860|B850|X870|H810|MORTAR|TOMAHAWK|CARBON|WIFI|Z890|Z790|H310|B360|H270|Z370|X299|Z690|B660|Z590|B560|B460|Z490/.test(n)) category = "Motherboard";
                        else if (/モニター|インチ|HZ|DISPLAY|液晶|QD-OLED/.test(n)) category = "Monitor";
                        else if (/ノート|STEALTH|CYBORG|PRESTIGE|SUMMIT|RAIDER|KATANA/.test(n)) category = "Notebook";
                        else if (/GEFORCE|RTX|VENTUS|GAMING SLIM|SUPRIM|ビデオカード|グラフィック/.test(n)) category = "Graphics Card";
                        else if (/FORGE|VELOX|PANO|CASE|GUNGNIR|PROSPECT|ケース/.test(n)) category = "Case";
                        else if (/COREFROZR|LIQUID|水冷|クーラー/.test(n)) category = "Cooler";
                        else if (/電源|UNIT|PSU|A[0-9]{3}G/.test(n)) category = "PSU";

                        results.push({
                            category: category,
                            name: "MSI " + nameRaw.replace(/[\\n\\r\\t,]/g, " ").trim(),
                            price: price,
                            url: url,
                            image_url: image_url
                        });
                    });
                    return results;
                }''')

                # 商品が1件も取れなかったら終了
                if not page_products or len(page_products) == 0:
                    print("🏁 これ以上商品が見つかりません。終了します。")
                    break

                all_products.extend(page_products)
                print(f"✅ {page_num}ページ目完了: {len(page_products)}件取得（累計: {len(all_products)}件）")
                
                page_num += 1
                
            except Exception as e:
                print(f"❌ エラー発生: {e}")
                break

        # 保存処理
        if all_products:
            keys = ["category", "name", "price", "url", "image_url"]
            filename = "msi_complete_catalog.csv"
            with open(filename, "w", encoding="utf-8-sig", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(all_products)
            print(f"🎉 完了！ 全{len(all_products)}件のデータを価格・画像付きで {filename} に保存しました。")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_all_msi())