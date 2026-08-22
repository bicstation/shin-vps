import os
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def main():
    if os.path.exists('token.json'):
        print("すでに token.json が存在します。")
        return

    # ポート 8080 でローカルサーバーを起動する設定
    flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
    creds = flow.run_local_server(port=8081, open_browser=False)

    with open('token.json', 'w') as token:
        token.write(creds.to_json())
    print("\n✅ token.json の生成に成功しました！")

if __name__ == '__main__':
    main()
