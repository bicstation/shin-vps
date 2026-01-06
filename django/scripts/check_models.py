import requests

GEMINI_API_KEY = "AIzaSyA-o3ZZUGLIscJJnD0HTnlxWqniLuwZhR8"
# 利用可能なモデル一覧を取得するエンドポイント
URL = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"

def check():
    print("利用可能なモデルを確認中...")
    res = requests.get(URL)
    data = res.json()
    
    if 'models' in data:
        print("\n=== あなたのキーで利用可能なモデル一覧 ===")
        for m in data['models']:
            # generateContent に対応しているモデルだけを表示
            if 'generateContent' in m['supportedGenerationMethods']:
                print(f"- {m['name']}")
    else:
        print("エラーが発生しました。APIキーを確認してください。")
        print(data)

if __name__ == "__main__":
    check()