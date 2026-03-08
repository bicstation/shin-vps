import os
import base64
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# --- パス・設定の定義 ---
# スクリプト自身の場所を基準にすることで Docker/ホスト 両方に対応
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# JSONフォルダとファイル (bs_json)
JSON_DIR = os.path.join(CURRENT_DIR, 'bs_json')
CLIENT_SECRETS_FILE = os.path.join(JSON_DIR, 'client_secrets.json')
TOKEN_FILE = os.path.join(JSON_DIR, 'token.json')

# 画像保存フォルダとファイル名 (bc_img)
IMG_DIR = os.path.join(CURRENT_DIR, 'bc_img')
current_time_str = time.strftime('%Y%m%d_%H%M%S')
IMG_PATH = os.path.join(IMG_DIR, f"chart_{current_time_str}.png")

# Blogger設定
SCOPES = ['https://www.googleapis.com/auth/blogger']
# Docker内から他コンテナを呼ぶ場合はサービス名、ホストから呼ぶ場合はlocalhost等
TARGET_URL = "http://bicstation-host:8083/" 

def get_blogger_service():
    """Blogger APIの認証とサービス構築"""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Docker内での実行時に token.json がないと入力待ちで止まるため注意
            if not os.path.exists(CLIENT_SECRETS_FILE):
                raise FileNotFoundError(f"❌ {CLIENT_SECRETS_FILE} が見つかりません。")
            
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    return build('blogger', 'v3', credentials=creds)

def capture_screenshot():
    """Seleniumで指定URLのスクショを撮影 (Headless設定)"""
    print(f"🚀 ブラウザ(Headless)を起動して {TARGET_URL} を撮影します...")
    
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1200,1000')
    
    # WebDriverのセットアップ
    # ※DockerイメージにChromeがインストールされている必要があります
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        driver.get(TARGET_URL)
        print("⌛ グラフの描画を待機中（5秒）...")
        time.sleep(5)
        
        if not os.path.exists(IMG_DIR):
            os.makedirs(IMG_DIR)
            
        driver.save_screenshot(IMG_PATH)
        print(f"📸 画像を保存しました: {IMG_PATH}")
    finally:
        driver.quit()

def post_to_blogger():
    """Bloggerへ画像を埋め込んで投稿"""
    if not os.path.exists(IMG_PATH):
        print("❌ スクショ画像が見つからないため、投稿を中止します。")
        return

    print("📝 Bloggerへ投稿を送信中...")
    service = get_blogger_service()
    
    with open(IMG_PATH, "rb") as img_file:
        b64_string = base64.b64encode(img_file.read()).decode('utf-8')
    
    post_content = f"""
    <h2>本日のAIスペックランキング</h2>
    <p>自動生成された最新のチャートです：</p>
    <div style="text-align: center;">
        <img src="data:image/png;base64,{b64_string}" style="width:100%; max-width:800px; border:1px solid #ddd; border-radius: 8px;" />
    </div>
    <p style="color: #666; font-size: 0.9em;">データ更新時刻: {time.strftime('%Y-%m-%d %H:%M:%S')}</p>
    """
    
    blogs = service.blogs().listByUser(userId='self').execute()
    blog = blogs['items'][0]
    
    body = {
        'kind': 'blogger#post',
        'title': f"【自動更新】本日のランキングチャート ({time.strftime('%m/%d')})",
        'content': post_content
    }
    
    result = service.posts().insert(blogId=blog['id'], body=body).execute()
    print(f"🎉 投稿成功！ URL: {result['url']}")

if __name__ == "__main__":
    try:
        capture_screenshot()
        post_to_blogger()
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")