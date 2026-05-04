# api/management/commands/migrate_pc_products.py

from django.core.management.base import BaseCommand
from api.models import Product, PCProduct

# 🔥 追加
from api.utils.genre_classifier import classify_genre


class Command(BaseCommand):
    help = 'Migrate PCProduct to Product（完全版）'

    def handle(self, *args, **kwargs):

        items = PCProduct.objects.all().prefetch_related("attributes")

        total = 0

        for item in items:

            # -------------------------
            # 🔥 ジャンル判定（ここが今回の核心）
            # -------------------------
            unified_genre = classify_genre(item.name)

            # -------------------------
            # Product作成 or 更新
            # -------------------------
            product_obj, created = Product.objects.update_or_create(
                source='pc',
                external_id=item.unique_id,

                defaults={
                    # -----------------
                    # 基本情報
                    # -----------------
                    'title': item.name or '',
                    'pc_product': item,

                    # -----------------
                    # 🔥 ジャンル（追加）
                    # -----------------
                    'unified_genre': unified_genre,

                    # -----------------
                    # 画像・リンク
                    # -----------------
                    'thumbnail_url': item.image_url,
                    'affiliate_url': item.url,

                    # -----------------
                    # 数値
                    # -----------------
                    'price': int(item.price) if item.price else 0,
                    'ranking_score': 0,

                    # -----------------
                    # メタ
                    # -----------------
                    'maker': item.maker or '',
                    'release_date': item.created_at,

                    # -----------------
                    # フラグ
                    # -----------------
                    'is_adult': False,
                    'is_active': True,
                    'is_visible': True,
                }
            )

            # -------------------------
            # 🔥 属性コピー
            # -------------------------
            attrs = list(item.attributes.all())

            if attrs:
                product_obj.attributes.set(attrs)
            else:
                product_obj.attributes.clear()

            total += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Migration completed: total={total}'
        ))