from django.core.management.base import BaseCommand
import firebase_admin
from firebase_admin import credentials, firestore
import os
import requests


class Command(BaseCommand):
    help = "ComfyUI + Firestore test"

    def handle(self, *args, **kwargs):

        # -----------------------
        # Firebase
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
        # ComfyUI
        # -----------------------
        site_key = "tiper"
        comfy_url = f"http://ai-{site_key}-host:8188"

        self.stdout.write(f"Checking ComfyUI: {comfy_url}")

        try:
            res = requests.get(comfy_url, timeout=5)

            if res.status_code == 200:
                self.stdout.write(self.style.SUCCESS("✅ ComfyUI OK"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ ComfyUI NG: {res.status_code}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ 接続エラー: {e}"))

        # -----------------------
        # Firestore保存
        # -----------------------
        doc_ref = db.collection("test").document()
        doc_ref.set({
            "status": "ok",
            "message": "both tested"
        })

        self.stdout.write(self.style.SUCCESS("🔥 Firestore 保存成功"))