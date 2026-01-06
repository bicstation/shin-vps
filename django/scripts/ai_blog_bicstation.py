import requests
import json
from requests.auth import HTTPBasicAuth

# --- 設定 ---
GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
WP_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
WP_USER = "bicstation"
WP_APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"

# 安定動作確認済みのエンドポイント
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

def generate_and_post():
    # あなたの構成案をベースにした高度なプロンプト
    prompt = """
    あなたはテック・ステーション系ブログ『Bicstation』の専門ライターです。
    
    【執筆テーマ例】
    「次世代の駅」「スマートガジェット」「鉄道×テクノロジー」
    
    【記事構成ルール】
    1行目：記事タイトル（例：駅はAIの目に守られる時代へ：ゼロリスク運行を実現する「ディープ・センシング」技術最前線）
    2行目以降：本文（導入、具体的な技術紹介、メリット、今後の展望）
    
    【トーン】
    専門的でありながら、一般の読者もワクワクするような親しみやすいトーンで執筆してください。
    「ディープ・センシング」「エッジAI」「LiDAR」などの用語を適宜織り交ぜてください。
    
    【出力】
    挨拶や余計な解説は一切省き、記事のタイトルと本文のみを出力してください。
    """
    
    payload_gemini = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    print("AIが Bicstation 向け専門記事を執筆中...")
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
            print(f"成功！Bicstationに専門記事が投稿されました。")
            print(f"ID: {res_wp.json().get('id')} / タイトル: {title}")
        else:
            print(f"WP投稿失敗: {res_wp.text}")

    except Exception as e:
        print(f"実行エラー: {e}")

if __name__ == "__main__":
    generate_and_post()