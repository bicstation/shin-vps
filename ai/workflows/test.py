import os
import requests
import json
import time

# -----------------------
# 環境設定
# -----------------------
ENV = "dev"

COMFY_BASE_URL = {
    "dev": "http://127.0.0.1:8188",
    "stg": "https://stg-ai.example.com",
    "prod": "https://ai.example.com",
    "sub": "https://img.example.com"
}[ENV]

COMFY_URL = COMFY_BASE_URL

BASE_DIR = os.path.dirname(__file__)
JSON_PATH = os.path.join(BASE_DIR, "image_generate.json")


# -----------------------
# URL生成
# -----------------------
def build_image_url(filename: str, subfolder: str) -> str:
    return f"{COMFY_BASE_URL}/view?filename={filename}&subfolder={subfolder}"


# -----------------------
# プロンプト生成
# -----------------------
def build_prompt(title: str):
    # 基本品質
    base = "masterpiece, best quality"

    # 主役（ここが作品になるポイント）
    subject = "female android, standing on rooftop"

    # シーン（タイトルと連動）
    scene = f"{title}, cyberpunk city, neon lights"

    # カメラ演出
    camera = "cinematic lighting, wide angle, depth of field"

    # 環境エフェクト
    environment = "rainy, reflections, wet surface"

    # 仕上げ品質
    quality = "ultra detailed, 8k, high resolution"

    positive = f"{base}, {subject}, {scene}, {camera}, {environment}, {quality}"

    negative = "low quality, blurry, text, watermark, bad anatomy"

    return positive, negative


# -----------------------
# ワークフロー生成
# -----------------------
def load_workflow(title: str):
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        workflow = json.load(f)

    positive, negative = build_prompt(title)

    workflow["5"]["inputs"]["text"] = positive
    workflow["7"]["inputs"]["text"] = negative

    return workflow


# -----------------------
# 画像生成
# -----------------------
def generate_image(title: str):
    workflow = load_workflow(title)

    # ① キュー登録
    res = requests.post(f"{COMFY_URL}/prompt", json={"prompt": workflow})
    res.raise_for_status()

    prompt_id = res.json()["prompt_id"]
    print("🟡 prompt_id:", prompt_id)

    # ② 完了待ち
    while True:
        time.sleep(1)

        history = requests.get(f"{COMFY_URL}/history/{prompt_id}").json()

        if prompt_id in history:
            print("✅ 生成完了")
            break

    # ③ 結果取得
    outputs = history[prompt_id]["outputs"]

    image_urls = []

    for node_id in outputs:
        node = outputs[node_id]

        if "images" in node:
            for img in node["images"]:
                filename = img["filename"]
                subfolder = img["subfolder"]

                url = build_image_url(filename, subfolder)
                image_urls.append(url)

    return image_urls


# -----------------------
# 実行
# -----------------------
if __name__ == "__main__":
    paths = generate_image("cyberpunk future city at night")

    print("🖼 保存画像:")
    for p in paths:
        print(p)