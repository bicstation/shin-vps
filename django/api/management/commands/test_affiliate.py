import urllib.parse

def generate_test_links(maker, unique_id, original_url):
    """
    本番用スクリプトと同じロジックでリンクを生成するテスト関数
    """
    maker_low = maker.lower()
    
    # 1. 二重エンコード防止ロジック
    # すでにエンコードされている可能性を考慮して一度デコード
    raw_url = urllib.parse.unquote(original_url)
    # 2. クリーンな1重エンコード（すべての記号を対象にするため safe=''）
    encoded_dest_url = urllib.parse.quote(raw_url, safe='')

    if 'dell' in maker_low:
        your_id = "nNBA6GzaGrQ"
        offer_prefix = "1568114"
        # リンクシェア形式
        affiliate_url = f"https://click.linksynergy.com/link?id={your_id}&offerid={offer_prefix}.{unique_id}&type=15&murl={encoded_dest_url}"
        service = "LinkShare (Dell)"
    else:
        # バリューコマース形式 (HP / Lenovo)
        sid, pid = "3697471", "892455531"
        affiliate_url = f"https://ck.jp.ap.valuecommerce.com/servlet/referral?sid={sid}&pid={pid}&vc_url={encoded_dest_url}"
        service = "ValueCommerce (HP/Lenovo)"

    return service, affiliate_url

# --- テストケース実行 ---

test_cases = [
    {
        "maker": "Dell",
        "unique_id": "bts001_qcm1250_jp",
        "url": "https://www.dell.com/ja-jp/shop/製品シリーズ/dell-pro-マイクロ-デスクトップ/spd/dell-pro-qcm1250-micro/bts001_qcm1250_jp"
        "url": "https://www.dell.com/ja-jp/shop/%E4%BB%8A%E9%80%B1%E3%81%AE%E3%81%8A%E8%B2%B7%E3%81%84%E5%BE%97/dell-14-plus-2-in-1%E3%83%8E%E3%83%BC%E3%83%88%E3%83%91%E3%82%BD%E3%82%B3%E3%83%B3/spd/dell-db04250-2-in-1-laptop/sdb0425020201monojp"
    },
    {
        "maker": "HP",
        "unique_id": "hp-pav-15",
        "url": "https://www.hp.com/jp-ja/shop/product-series/pavilion-15-eg.html?query=日本語テスト"
    }
]

print("=== アフィリエイトリンク変換テスト ===\n")

for case in test_cases:
    service, final_link = generate_test_links(case["maker"], case["unique_id"], case["url"])
    print(f"【メーカー】: {case['maker']} ({service})")
    print(f"【元URL】    : {case['url']}")
    print(f"【生成リンク】: {final_link}")
    
    # 検証ポイント
    if "%25" in final_link:
        print("❌ 警告: 二重エンコード（%25）が検出されました！")
    elif "%E8%A3%BD%E5%93%81" in final_link or "%E6%97%A5%E6%9C%AC%E8%AA%9E" in final_link:
        print("✅ 成功: マルチバイト文字が正しく1重エンコードされています。")
    print("-" * 50)