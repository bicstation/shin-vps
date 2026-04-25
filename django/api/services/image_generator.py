import requests
import time
import os
import json
import shutil


def generate_image(title, content, comfy_url="http://ai-tiper-host:8188"):

    # -----------------------
    # プロンプト生成
    # -----------------------
    prompt_text = build_prompt(title, "tech")
    
    print("🧠 Prompt:", prompt_text.strip())

    # -----------------------
    # workflow読み込み
    # -----------------------
    workflow_path = "/usr/src/app/ai/workflows/image_generate.json"

    if not os.path.exists(workflow_path):
        raise Exception("❌ workflow file not found")

    with open(workflow_path, "r") as f:
        workflow = json.load(f)
    
    workflow["5"]["inputs"]["text"] = prompt_text

    # -----------------------
    # プロンプト差し替え（positiveのみ）
    # -----------------------
    for node in workflow.values():
        if node.get("class_type") == "CLIPTextEncode":
            title_meta = node.get("_meta", {}).get("title", "")

            if "プロンプト" in title_meta:
                node["inputs"]["text"] = prompt_text

    # -----------------------
    # モデル設定
    # -----------------------
    model_name = os.getenv("COMFY_MODEL", "v1-5-pruned-emaonly.safetensors")
    print(f"🧠 Using model: {model_name}")

    for node in workflow.values():
        if node.get("class_type") == "CheckpointLoaderSimple":
            node["inputs"]["ckpt_name"] = model_name

    # -----------------------
    # 生成リクエスト（リトライ付き）
    # -----------------------
    MAX_RETRY = 3

    for i in range(MAX_RETRY):
        try:
            print(f"🚀 ComfyUI request try: {i+1}")

            res = requests.post(
                f"{comfy_url}/prompt",
                json={"prompt": workflow},
                timeout=300
            )

            data = res.json()

            if "prompt_id" not in data:
                print("❌ INVALID RESPONSE:", data)
                raise Exception("No prompt_id returned from ComfyUI")

            prompt_id = data["prompt_id"]

            print("🟡 prompt_id:", prompt_id)
            break

        except Exception as e:
            print(f"❌ request failed (try {i+1}):", e)

            if i == MAX_RETRY - 1:
                raise Exception(f"❌ ComfyUI request failed: {e}")

            time.sleep(5)

    # -----------------------
    # 完了待ち
    # -----------------------
    start_time = time.time()

    while True:
        if time.time() - start_time > 600:
            raise Exception("❌ Generation timeout")

        time.sleep(2)

        try:
            history_res = requests.get(
                f"{comfy_url}/history/{prompt_id}",
                timeout=30
            )
            history_res.raise_for_status()
            history = history_res.json()

        except Exception as e:
            print("⚠️ history retry:", e)
            time.sleep(3)
            continue

        if prompt_id in history:
            print("✅ Generation complete")

            outputs = history[prompt_id].get("outputs", {})
            found_image = None

            for node_id, node in outputs.items():

                if "images" in node and node["images"]:
                    image = node["images"][0]
                    filename = image["filename"]
                    subfolder = image.get("subfolder", "")

                    image_url = f"{comfy_url}/view?filename={filename}&subfolder={subfolder}&type=output"

                    MEDIA_DIR = "/usr/src/app/media/generated"
                    os.makedirs(MEDIA_DIR, exist_ok=True)

                    save_path = os.path.join(MEDIA_DIR, filename)

                    try:
                        for i in range(3):
                            try:
                                img_res = requests.get(image_url, stream=True, timeout=120)
                                img_res.raise_for_status()
                                break
                            except Exception as e:
                                print(f"❌ image retry {i+1}:", e)
                                time.sleep(3)

                        with open(save_path, "wb") as f:
                            shutil.copyfileobj(img_res.raw, f)

                    except Exception as e:
                        print("❌ Save failed:", e)
                        continue

                    public_url = f"http://localhost:8083/media/generated/{filename}"
                    print("🖼 Saved:", public_url)

                    return public_url

            raise Exception("No image found in outputs")

    raise Exception("❌ No image returned from ComfyUI")


def build_prompt(title, category="tech"):

    base = "clean modern illustration, minimal, professional, no text, no watermark"

    category_map = {
        "tech": "futuristic server infrastructure, glowing data flow, network connections",
        "business": "financial growth chart, modern office, success concept",
        "seo": "search interface, analytics dashboard, global network"
    }

    composition = "isometric view, centered composition"
    quality = "high detail, cinematic lighting, 4k"

    # タイトルを軽く加工（雑でOK）
    keywords = title.replace("の", " ").replace("方法", "").strip()

    return f"{base}, {category_map.get(category, '')}, {keywords}, {composition}, {quality}"