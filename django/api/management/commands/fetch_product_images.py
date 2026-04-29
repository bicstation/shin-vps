from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.files.base import ContentFile
from api.models import Product

import requests
import uuid
import os


class Command(BaseCommand):
    help = "Fetch and cache product images (top N by ranking_score)"

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=100)
        parser.add_argument("--force", action="store_true")  # 強制再取得

    def handle(self, *args, **options):
        limit = options["limit"]
        force = options["force"]

        qs = Product.objects.filter(
            is_active=True,
            is_visible=True
        ).order_by("-ranking_score")[:limit]

        ok = 0
        skip = 0
        fail = 0

        for p in qs:
            # 元URL（なければthumbnail_urlから補完）
            src = p.image_source or p.thumbnail_url
            if not src:
                skip += 1
                continue

            # 既にローカルがある場合はスキップ（forceで上書き）
            if p.image_local and not force:
                skip += 1
                continue

            try:
                # ダウンロード
                res = requests.get(src, timeout=10)
                if res.status_code != 200:
                    fail += 1
                    continue

                # ファイル名（衝突回避）
                ext = src.split(".")[-1].split("?")[0]
                if len(ext) > 5:
                    ext = "jpg"
                filename = f"{uuid.uuid4()}.{ext}"

                # 保存
                p.image_source = src
                p.image_local.save(filename, ContentFile(res.content), save=False)
                p.image_fetched = True
                p.save(update_fields=["image_source", "image_local", "image_fetched"])

                ok += 1

            except Exception as e:
                fail += 1
                self.stdout.write(self.style.WARNING(f"ERR {p.id}: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"Done. ok={ok} skip={skip} fail={fail}"
        ))