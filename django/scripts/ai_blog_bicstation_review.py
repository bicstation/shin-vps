import requests
import json
from requests.auth import HTTPBasicAuth

# --- 設定 ---
GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
WP_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
WP_USER = "bicstation"
WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

def generate_and_post():
    # 商品紹介に特化したプロンプト
    prompt = """
    あなたはガジェット・鉄道・テック系ブログ『Bicstation』の専門レビュアーです。
    
    【今回の任務】
    「通勤・通学・出張を快適にするガジェット」または「デスク周りを進化させる最新テック商品」を1つピックアップし、読者が欲しくなる紹介記事を書いてください。
    
    【記事構成】
    1行目：キャッチーな商品紹介タイトル（例：移動時間が書斎に変わる？最新ノイズキャンセリングイヤホン「〇〇」徹底レビュー）
    2行目以降：
    - 導入：現代の通勤・移動における悩み。
    - 商品紹介：その商品の特徴（デザイン、機能）。
    - 活用シーン：駅や電車内、オフィスでどう役立つか。
    - 結論：どんな人におすすめか。
    
    【トーン】
    「これを使えば生活が変わる」というワクワク感を重視しつつ、専門用語を交えて信頼感を出す。
    
    【出力ルール】
    挨拶不要。タイトルと本文のみ。最後に「[商品詳細リンクはこちら]」というダミーテキストを含めてください。
    """
    
    payload_gemini = { "contents": [{ "parts": [{"text": prompt}] }] }
    
    print("AIが商品紹介記事を執筆中...")
    try:
        response_gemini = requests.post(GEMINI_URL, json=payload_gemini)
        res_json = response_gemini.json()
        
        if 'error' in res_json:
            print(f"Gemini APIエラー: {res_json['error']['message']}")
            return

        ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
        full_text = ai_text.strip().split('\n')
        
        title = full_text[0].replace('#', '').strip()
        content = '\n'.join(full_text[1:]).strip()

        payload_wp = {
            "title": title,
            "content": content,
            "status": "publish"
        }
        
        res_wp = requests.post(
            WP_URL, 
            json=payload_wp, 
            auth=HTTPBasicAuth(WP_USER, WP_APP_PASSWORD)
        )
        
        if res_wp.status_code == 201:
            print(f"成功！商品紹介記事が Bicstation に投稿されました。")
            print(f"タイトル: {title}")
        else:
            print(f"WP投稿失敗: {res_wp.text}")

    except Exception as e:
        print(f"実行エラー: {e}")

if __name__ == "__main__":
    generate_and_post()