import requests
import time

def build_image_prompt(title, content):
    summary = content[:150]

    return f"""
    thumbnail image for article: {title},
    {summary},
    modern, clean composition, eye-catching,
    high quality, cinematic lighting
    """


def generate_image(title, content, comfy_url="http://ai-tiper-host:8188"):
    prompt_text = build_image_prompt(title, content)

    # workflow読み込み
    import json
    with open("/usr/src/app/ai/workflows/image_generate.json", "r") as f:
        workflow = json.load(f)

    # プロンプト差し替え
    workflow["5"]["inputs"]["text"] = prompt_text

    # ComfyUIへ送信
    res = requests.post(
        f"{comfy_url}/prompt",
        json={"prompt": workflow}
    )
    res.raise_for_status()

    prompt_id = res.json()["prompt_id"]

    # 完了待ち
    start_time = time.time()
    timeout_sec = 600

    while True:
        if time.time() - start_time > timeout_sec:
            raise Exception("❌ Generation timeout")

        time.sleep(5)

        history = requests.get(
            f"{comfy_url}/history/{prompt_id}"
        ).json()

        if prompt_id in history:
            outputs = history[prompt_id].get("outputs", {})

            for node in outputs.values():
                if "images" in node:
                    image = node["images"][0]
                    filename = image["filename"]

                    # return f"http://localhost:8083/view?filename={filename}&type=output"
                    return f"http://localhost:8083/media/{filename}"