# /home/maya/shin-vps/django/api/management/commands/test_comfy.py

from django.core.management.base import BaseCommand
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
import requests
import time

class Command(BaseCommand):
    help = "ComfyUI generate + Firestore save"

    def handle(self, *args, **kwargs):

        # -----------------------
        # Firebase 初期化
        # -----------------------
        BASE_DIR = os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(__file__)
                )
            )
        )

        cred_path = os.path.join(
            BASE_DIR,
            "config",
            "firebase",
            "serviceAccountKey.json"
        )

        self.stdout.write(f"Using cred: {cred_path}")

        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)

        db = firestore.client()

        # -----------------------
        # ComfyUI 設定
        # -----------------------
        # comfy_url = "http://ai-tiper-host:8188"
        comfy_url = "http://comfyui:8188"

        # -----------------------
        # ワークフロー読み込み
        # -----------------------
        workflow_path = os.path.join(
            BASE_DIR,
            "ai",
            "workflows",
            "image_generate.json"
        )

        with open(workflow_path, "r", encoding="utf-8") as f:
            workflow = json.load(f)

        # -----------------------
        # プロンプト
        # -----------------------
        title = "AIでブログ収益化する方法"

        positive = """
        masterpiece, best quality,
        blog header image,
        AI blog monetization,
        laptop workspace,
        clean composition,
        minimalist,
        wide composition,
        space for text,
        soft lighting,
        high contrast,
        no text
        """
        
        
        negative = "low quality, blurry, text, watermark, bad anatomy"

        workflow["5"]["inputs"]["text"] = positive
        workflow["7"]["inputs"]["text"] = negative
        
        model_name = os.getenv("COMFY_MODEL", "v1-5-pruned-emaonly.safetensors")
        self.stdout.write(f"🧠 Using model: {model_name}")


        # CheckpointLoaderSimple のモデルを上書き
        for node_id, node in workflow.items():
            if node.get("class_type") == "CheckpointLoaderSimple":
                node["inputs"]["ckpt_name"] = model_name
        
        
        # -----------------------
        # ① 生成リクエスト
        # -----------------------
        self.stdout.write("🚀 Generating image...")

        # res = requests.post(f"{comfy_url}/prompt", json={"prompt": workflow})
        
        res = requests.post(
            f"{comfy_url}/prompt",
            # json={"prompt": workflow},
            json={
                "prompt": workflow,
                "extra_data": {
                    "outputs": ["18"]
                }
            },
            timeout=120
        )
        
        print("STATUS:", res.status_code)
        print("RESPONSE:", res.text)
        
        res.raise_for_status()

        data = res.json()

        if "prompt_id" not in data:
            raise Exception(f"❌ prompt_id取得失敗: {data}")

        print("STATUS:", res.status_code)
        print("RESPONSE:", res.text)

        prompt_id = data["prompt_id"]

        # -----------------------
        # ② 完了待ち
        # -----------------------
        start_time = time.time()
        timeout_sec = 900  # 15分

        while True:
            self.stdout.write("⏳ waiting...")

            if time.time() - start_time > timeout_sec:
                raise Exception("❌ Generation timeout")

            time.sleep(5)

            try:
                # 👇 ここ変更（重要）
                res = requests.get(
                    f"{comfy_url}/history",
                    timeout=30
                )
                res.raise_for_status()

                history_all = res.json()

                # 👇 prompt_idで探す
                if prompt_id in history_all:
                    history = history_all[prompt_id]
                    self.stdout.write("✅ Generation complete")
                    break

            except requests.exceptions.RequestException as e:
                self.stdout.write(f"⚠️ retry: {e}")

        # -----------------------
        # ③ 画像取得
        # -----------------------

        outputs = history.get("outputs", {})

        image_urls = []

        for node_id in outputs:
            node = outputs[node_id]

            if "images" in node:
                for img in node["images"]:
                    filename = img["filename"]
                    subfolder = img["subfolder"]

                    url = f"{comfy_url}/view?filename={filename}&subfolder={subfolder}&type=output"
                    image_urls.append(url)

        # -----------------------
        # ④ Firestore 保存
        # -----------------------
        doc_ref = db.collection("ai_images").document()
        
        if not image_urls:
            raise Exception("❌ 画像が生成されていません")

        doc_ref.set({
            "prompt": positive,
            "negative": negative,
            "images": image_urls,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        self.stdout.write(self.style.SUCCESS("🔥 保存成功"))
        self.stdout.write(f"🖼 {image_urls}")