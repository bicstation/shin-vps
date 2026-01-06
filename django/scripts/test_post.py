import requests
from requests.auth import HTTPBasicAuth

# 基本設定
WP_URL = "https://blog.tiper.live/wp-json/wp/v2/posts"
USER = "bicstation"
APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"

def post_to_wordpress(title, content):
    payload = {
        "title": title,
        "content": content,
        "status": "publish"
    }
    
    response = requests.post(
        WP_URL, 
        json=payload, 
        auth=HTTPBasicAuth(USER, APP_PASSWORD)
    )
    
    if response.status_code == 201:
        print(f"成功！投稿ID: {response.json().get('id')}")
    else:
        print(f"失敗: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    post_to_wordpress(
        "Pythonスクリプトからの初投稿", 
        "職場のPCからVPS経由でPythonを動かして投稿しています。"
    )