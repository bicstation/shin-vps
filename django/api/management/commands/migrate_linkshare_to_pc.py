# -*- coding: utf-8 -*-

import re
import ast

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from api.models.linkshare_products import LinkshareProduct
from api.models.pc_products import PCProduct


# ==========================================================
# Utils
# ==========================================================

def clean_price(val):

    if val is None:
        return 0

    try:
        return int(float(val))

    except:
        return 0


# ==========================================================
# Semantic Extraction
# ==========================================================

def extract_cpu(text):

    if not text:
        return None

    patterns = [

        # Intel
        r'Core\s?Ultra\s?\d+',
        r'Core\s?i[3579]',
        r'Core\s?[3579]',

        # AMD
        r'Ryzen\s?[3579]',
        r'Ryzen\s?AI',

        # Snapdragon
        r'Snapdragon\s?X\s?Elite',
        r'Snapdragon\s?X\s?Plus',
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:
            return match.group(0)

    return None


def extract_gpu(text):

    if not text:
        return None

    patterns = [

        r'RTX\s?\d{4}',
        r'GTX\s?\d{3,4}',
        r'RX\s?\d{4,5}',
        r'Arc\s?[A-Z]?\d+',
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:
            return match.group(0)

    return None


def extract_storage(text):

    """
    例:
    512GB SSD
    1TB SSD
    """

    if not text:
        return None

    patterns = [

        r'(\d+)\s?TB\s?SSD',
        r'(\d+)\s?GB\s?SSD',
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:

            value = match.group(1)

            # TB → GB変換
            if "TB" in match.group(0).upper():

                try:
                    return int(value) * 1000

                except:
                    return None

            try:
                return int(value)

            except:
                return None

    return None


def extract_memory(text):

    """
    SSD容量を除外して memory 抽出
    """

    if not text:
        return None

    # ======================================================
    # SSD容量を先に除去
    # ======================================================
    cleaned = re.sub(
        r'\d+\s?(GB|TB)\s?SSD',
        '',
        text,
        flags=re.I
    )

    # ======================================================
    # Memory抽出
    # ======================================================
    match = re.search(
        r'(\d+)\s?GB',
        cleaned,
        re.I
    )

    if match:

        try:
            return int(match.group(1))

        except:
            return None

    return None


def extract_refresh_rate(text):

    if not text:
        return None

    match = re.search(
        r'(\d+)\s?Hz',
        text,
        re.I
    )

    if match:

        try:
            return int(match.group(1))

        except:
            return None

    return None


def extract_display_type(text):

    if not text:
        return None

    patterns = [

        # OLED
        r'QD-OLED',
        r'\bOLED\b',

        # Mini LED
        r'Mini\s?LED',

        # IPS / VA
        r'\bIPS\b',
        r'\bVA\b',
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:
            return match.group(0)

    return None


def extract_product_type(text):

    if not text:
        return "pc"

    lower = text.lower()
      
    # ======================================================
    # Monitor
    # ======================================================

    MONITOR_KEYWORDS = [

        "monitor",
        "display",
        "oled monitor",

        "モニター",
        "ディスプレイ",
        "液晶",

        "240hz",
        "165hz",
        "144hz",

        "qd-oled",
        "湾曲",
    ]

    monitor_hits = 0

    for keyword in MONITOR_KEYWORDS:

        if keyword in lower:
            monitor_hits += 1

    # モニター特徴が複数ある場合
    if monitor_hits >= 1:
        return "monitor"

    # OLED + 高Hz は monitor 可能性高
    if "oled" in lower and "hz" in lower:
        return "monitor"

    # ======================================================
    # Software
    # ======================================================
    if "office" in lower:
        return "software"

    return "pc"


# ==========================================================
# Command
# ==========================================================

class Command(BaseCommand):

    help = "Migrate LinkshareProduct → PCProduct（完全版 Semantic Runtime）"

    def add_arguments(self, parser):

        parser.add_argument(
            '--limit',
            type=int,
            default=0
        )

    def handle(self, *args, **options):

        self.stdout.write(
            "🚀 START: Linkshare → PCProduct"
        )

        queryset = (

            LinkshareProduct.objects

            .filter(
                is_active=True
            )

            .order_by(
                '-updated_at'
            )
        )

        if options['limit'] > 0:

            queryset = queryset[:options['limit']]

        total = 0
        created_count = 0
        skipped_count = 0

        with transaction.atomic():

            for item in queryset:

                # ==================================================
                # Basic
                # ==================================================
                sku = item.sku
                mid = item.merchant_id

                if not sku or not mid:

                    skipped_count += 1
                    continue

                unique_id = f"{mid}_{sku}"

                # ==================================================
                # Normalize
                # ==================================================
                name = item.product_name or ""

                price = clean_price(
                    item.price
                )

                image_url = (
                    item.image_url or ""
                )

                maker = (
                    item.merchant_name
                    or "unknown"
                )

                # ==================================================
                # RAW CSV DATA
                # ==================================================
                raw = item.raw_csv_data or {}

                if isinstance(raw, str):

                    try:
                        raw = ast.literal_eval(raw)

                    except:
                        raw = {}

                # ==================================================
                # Semantic Source Text
                # ==================================================
                semantic_text = " ".join([

                    name,

                    raw.get(
                        "short_description",
                        ""
                    ) if isinstance(raw, dict) else "",

                    raw.get(
                        "description",
                        ""
                    ) if isinstance(raw, dict) else "",
                ])

                # ==================================================
                # Structured Semantic Extraction
                # ==================================================
                cpu_model = extract_cpu(
                    semantic_text
                )

                gpu_model = extract_gpu(
                    semantic_text
                )

                storage_gb = extract_storage(
                    semantic_text
                )

                memory_gb = extract_memory(
                    semantic_text
                )

                refresh_rate = extract_refresh_rate(
                    semantic_text
                )

                display_type = extract_display_type(
                    semantic_text
                )

                product_type = extract_product_type(
                    semantic_text
                )

                # ==================================================
                # URL Recovery
                # ==================================================
                url = (

                    item.product_url

                    or item.affiliate_url

                    or (
                        raw.get("buy_url")
                        if isinstance(raw, dict)
                        else None
                    )

                    or (
                        raw.get("linkurl")
                        if isinstance(raw, dict)
                        else None
                    )

                    or (
                        raw.get("producturl")
                        if isinstance(raw, dict)
                        else None
                    )
                )

                # ==================================================
                # Skip Invalid URL
                # ==================================================
                if not url:

                    skipped_count += 1
                    continue

                try:

                    obj, created = (

                        PCProduct.objects

                        .update_or_create(

                            unique_id=unique_id,

                            defaults={

                                # ======================================
                                # Basic
                                # ======================================
                                "site_prefix":
                                    str(mid),

                                "maker":
                                    maker,

                                "name":
                                    name,

                                "price":
                                    price,

                                "url":
                                    url,

                                "affiliate_url":
                                    url,

                                "image_url":
                                    image_url,

                                "description":
                                    semantic_text[:1000],

                                # ======================================
                                # Structured Semantic Runtime
                                # ======================================
                                "cpu_model":
                                    cpu_model,

                                "gpu_model":
                                    gpu_model,

                                "memory_gb":
                                    memory_gb,

                                "storage_gb":
                                    storage_gb,

                                "display_info":
                                    display_type,

                                # ======================================
                                # Adaptive Runtime
                                # ======================================
                                "target_segment":
                                    product_type,

                                # ======================================
                                # Unified Genre
                                # ======================================
                                "raw_genre":
                                    "PC",

                                "unified_genre":
                                    "PC",

                                # ======================================
                                # Status
                                # ======================================
                                "stock_status":
                                    "在庫あり",

                                "is_active":
                                    True,

                                "affiliate_updated_at":
                                    timezone.now(),
                            }
                        )
                    )

                    total += 1

                    if created:
                        created_count += 1

                except Exception as e:

                    self.stderr.write(
                        f"❌ Error {unique_id}: {e}"
                    )

        self.stdout.write(

            self.style.SUCCESS(

                f"✅ DONE: {total} processed "
                f"(new: {created_count}, skipped: {skipped_count})"
            )
        )