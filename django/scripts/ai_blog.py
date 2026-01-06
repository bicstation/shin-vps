import requests
import json
from requests.auth import HTTPBasicAuth

# --- 設定 ---
GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
WP_URL = "https://blog.tiper.live/wp-json/wp/v2/posts"
WP_USER = "bicstation"
WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"

# 診断リストに存在した「models/gemini-flash-latest」を直接指定
# URLのモデル名部分には「gemini-flash-latest」のみを入れます
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

def generate_and_post():
    prompt = "最新のテクノロジーに関する興味深いニュースを1つ選び、ブログ記事を書いてください。日本語で、タイトルを1行目、本文を2行目以降にしてください。"
    
    payload_gemini = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    print("AIが記事を執筆中 (Gemini Flash Latest)...")
    try:
        response_gemini = requests.post(GEMINI_URL, json=payload_gemini)
        res_json = response_gemini.json()
        
        # エラー表示の強化
        if 'error' in res_json:
            print(f"Gemini APIエラー: {res_json['error']['message']}")
            return

        # AIの回答を抽出
        if 'candidates' not in res_json:
            print(f"応答にデータが含まれていません: {res_json}")
            return
            
        ai_text = res_json['candidates'][0]['content']['parts'][0]['text']
        full_text = ai_text.strip().split('\n')
        title = full_text[0].replace('#', '').strip()
        content = '\n'.join(full_text[1:]).strip()

        # WordPressに投稿
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
            print(f"成功！投稿ID: {res_wp.json().get('id')}")
            print(f"タイトル: {title}")
        else:
            print(f"WordPress投稿失敗: {res_wp.text}")

    except Exception as e:
        print(f"実行エラー: {e}")

if __name__ == "__main__":
    generate_and_post()