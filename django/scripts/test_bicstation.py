import requests
from requests.auth import HTTPBasicAuth

# カスタム投稿タイプのエンドポイント
WP_URL = "https://blog.tiper.live/wp-json/wp/v2/bicstation"
USER = "bicstation"
APP_PASSWORD = "9re0 t3de WCe1 u1IL MudX 31IY"

def post_to_bicstation():
    payload = {
        "title": "Bicstation カスタム投稿テスト",
        "content": "これはカスタム投稿タイプ 'bicstation' への自動投稿テストです。",
        "status": "publish"
    }
    
    response = requests.post(
        WP_URL, 
        json=payload, 
        auth=HTTPBasicAuth(USER, APP_PASSWORD)
    )
    
    if response.status_code == 201:
        print(f"成功！カスタム投稿ID: {response.json().get('id')}")
    else:
        print(f"失敗: {response.status_code}")
        # もし404エラーが出る場合は、REST APIが有効になっていない可能性があります
        print(response.text)

if __name__ == "__main__":
    post_to_bicstation()