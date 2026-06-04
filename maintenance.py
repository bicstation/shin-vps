# 

import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# スコープ（投稿権限）
SCOPES = ['https://www.googleapis.com/auth/blogger']
# あなたが置いたパスを直接指定
CLIENT_SECRETS_FILE = '/home/maya/dev/shin-vps/django/api/management/commands/bs_json/client_secrets.json'

def get_blogger_service():
    creds = None
    # 実行した場所に token.json が作られます
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # 修正したパスで読み込み
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            # VPSなどのリモート環境なら、ブラウザが開かないので以下のようにします
            creds = flow.run_local_server(port=0, open_browser=False)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('blogger', 'v3', credentials=creds)

def main():
    try:
        service = get_blogger_service()
        blogs = service.blogs().listByUser(userId='self').execute()
        
        if 'items' not in blogs:
            print("ブログが見つかりませんでした。")
            return
        
        blog = blogs['items'][0]
        blog_id = blog['id']
        
        post_body = {
            'kind': 'blogger#post',
            'title': '深夜の自動投稿テスト成功！',
            'content': '<h2>ついに繋がりました！</h2><p>これからSSGのグラフがここに自動で並びます。</p>'
        }
        
        result = service.posts().insert(blogId=blog_id, body=post_body).execute()
        print(f"🎉 大成功です！ URL: {result['url']}")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")

if __name__ == '__main__':
    main()
