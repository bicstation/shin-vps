# -*- coding: utf-8 -*-
import os
from google_auth_oauthlib.flow import InstalledAppFlow

JSON_DIR = '/usr/src/app/api/management/commands/bs_json'
CLIENT_SECRET = os.path.join(JSON_DIR, 'client_secrets.json')
TOKEN_JSON = os.path.join(JSON_DIR, 'token.json')
SCOPES = ['https://www.googleapis.com/auth/blogger']

if not os.path.exists(CLIENT_SECRET):
    print(f'❌ client_secrets.jsonが見つかりません: {CLIENT_SECRET}')
else:
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET, SCOPES)
    flow.redirect_uri = 'urn:ietf:wg:oauth:2.0:oob'
    auth_url, _ = flow.authorization_url(prompt='consent')
    print(f'\n1. 以下のURLをコピーしてブラウザで開いてください:\n\n{auth_url}\n')
    auth_code = input('2. ブラウザで表示されたコードをここに貼り付けてください: ').strip()
    flow.fetch_token(code=auth_code)
    with open(TOKEN_JSON, 'w') as f:
        f.write(flow.credentials.to_json())
    print(f'\n✅ 成功！トークンを保存しました: {TOKEN_JSON}')
