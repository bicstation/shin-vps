# -*- coding: utf-8 -*-

import json
import requests
import re
import os
import time
import itertools
import threading

from datetime import datetime
from concurrent.futures import (
    ThreadPoolExecutor,
    as_completed
)

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q

from api.models.pc_products import (
    PCProduct
)

# =========================================================
# API KEY
# =========================================================
API_KEYS = []

for i in range(10):

    key = os.getenv(
        f"GEMINI_API_KEY_{i}"
    )

    if key:
        API_KEYS.append(key)

GENERAL_KEY = os.getenv(
    "GEMINI_API_KEY"
)

if (
    GENERAL_KEY
    and GENERAL_KEY not in API_KEYS
):
    API_KEYS.append(GENERAL_KEY)

VALID_KEYS = [

    k for k in API_KEYS
    if k and len(k) > 10

]


# =========================================================
# Thread Safe Key Rotation
# =========================================================
class ThreadSafeIter:

    def __init__(self, it):

        self.it = it

        self.lock = threading.Lock()

    def __iter__(self):

        return self

    def __next__(self):

        with self.lock:

            return next(self.it)


key_cycle = ThreadSafeIter(
    itertools.cycle(VALID_KEYS)
)


# =========================================================
# Rate Limit
# =========================================================
MAX_WORKERS = (
    len(VALID_KEYS)
    if len(VALID_KEYS) > 0
    else 1
)

SAFE_KEY_RPM = 6

SAFE_TOTAL_RPM = (
    len(VALID_KEYS)
    * SAFE_KEY_RPM
)

INTERVAL = (

    60 / SAFE_TOTAL_RPM

    if SAFE_TOTAL_RPM > 0

    else 2.0
)


# =========================================================
# Prompt Path
# =========================================================
BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

PROMPT_BASE_DIR = os.path.join(
    BASE_DIR,
    "prompt"
)


# =========================================================
# Command
# =========================================================
class Command(BaseCommand):

    help = (
        "Gemini AI による "
        "PCスペック解析"
    )

    # =====================================================
    # Arguments
    # =====================================================
    def add_arguments(self, parser):

        parser.add_argument(
            'unique_id',
            type=str,
            nargs='?'
        )

        parser.add_argument(
            '--limit',
            type=int,
            default=1
        )

        parser.add_argument(
            '--maker',
            type=str
        )

        parser.add_argument(
            '--model',
            type=str
        )

        parser.add_argument(
            '--force',
            action='store_true'
        )

        parser.add_argument(
            '--null-only',
            action='store_true'
        )

        parser.add_argument(
            '--update-all',
            action='store_true'
        )

    # =====================================================
    # Load Prompt
    # =====================================================
    def load_prompt_file(
        self,
        filename
    ):

        path = os.path.join(
            PROMPT_BASE_DIR,
            filename
        )

        try:

            with open(
                path,
                'r',
                encoding='utf-8'
            ) as f:

                return f.read()

        except FileNotFoundError:

            return ""

    # =====================================================
    # Maker Prompt Mapping
    # =====================================================
    def get_maker_slug(
        self,
        maker_name
    ):

        if not maker_name:
            return "standard"

        m = str(
            maker_name
        ).lower()

        mapping = {

            'fmv': 'fmv',
            'fujitsu': 'fmv',
            '富士通': 'fmv',

            'dynabook': 'dynabook',

            'asus': 'asus',

            'hp': 'hp',

            'dell': 'dell',

            'lenovo': 'lenovo',

            'mouse': 'mouse',

            'nec': 'nec',

            'ark': 'ark',
        }

        for k, v in mapping.items():

            if k in m:
                return v

        return "standard"

    # =====================================================
    # Main
    # =====================================================
    def handle(self, *args, **options):

        if not VALID_KEYS:

            self.stdout.write(

                self.style.ERROR(
                    "❌ APIキー未設定"
                )
            )

            return

        query = PCProduct.objects.all()

        # =================================================
        # Query Mode
        # =================================================
        if options['update_all']:

            self.stdout.write(

                self.style.WARNING(
                    "⚠️ update_all mode"
                )
            )

        elif options['null_only']:

            query = query.filter(
                last_spec_parsed_at__isnull=True
            )

        elif not options['force']:

            query = query.filter(

                Q(
                    last_spec_parsed_at__isnull=True
                )

                |

                Q(score_cpu=0)

                |

                Q(score_ai=0)
            )

        # =================================================
        # Filters
        # =================================================
        if options['unique_id']:

            query = query.filter(
                unique_id=options['unique_id']
            )

        elif options['maker']:

            query = query.filter(
                maker__icontains=options['maker']
            )

        products = list(
            query[:options['limit']]
        )

        if not products:

            self.stdout.write(

                self.style.WARNING(
                    "🔎 対象製品なし"
                )
            )

            return

        model_id = (

            options['model']

            or

            (
                self.load_prompt_file(
                    'ai_models.txt'
                )
                .split('\n')[0]
                .strip()
            )

            or

            "gemma-3-27b-it"
        )

        self.stdout.write(

            self.style.SUCCESS(

                f"🚀 解析開始: "
                f"{len(products)} 件"

            )
        )

        self.counter = 0

        with ThreadPoolExecutor(
            max_workers=MAX_WORKERS
        ) as executor:

            future_to_product = {}

            for i, product in enumerate(products):

                if i > 0:
                    time.sleep(INTERVAL)

                self.counter += 1

                future = executor.submit(

                    self.analyze_product,

                    product,

                    model_id,

                    self.counter,

                    len(products)
                )

                future_to_product[
                    future
                ] = product

            for future in as_completed(
                future_to_product
            ):

                try:

                    future.result()

                except Exception as e:

                    p = future_to_product[
                        future
                    ]

                    self.stdout.write(

                        self.style.ERROR(

                            f"❌ "
                            f"{p.unique_id}: "
                            f"{str(e)}"

                        )
                    )

    # =====================================================
    # Analyze Product
    # =====================================================
    def analyze_product(
        self,
        product,
        model_id,
        count,
        total,
        retry_count=0
    ):

        current_api_key = next(
            key_cycle
        )

        # =================================================
        # Prompt
        # =================================================
        base_pc_prompt = (

            self.load_prompt_file(
                'analyze_pc_prompt.txt'
            )

            or

            (
                "メーカー:{maker}\n"
                "製品名:{name}\n"
                "価格:{price}\n"
                "説明:{description}\n"
            )
        )

        maker_slug = self.get_maker_slug(
            product.maker
        )

        brand_rules = (

            self.load_prompt_file(

                f"analyze_{maker_slug}_prompt.txt"

            )

            or

            self.load_prompt_file(
                'analyze_pc_prompt.txt'
            )
        )

        # =================================================
        # JSON Structure
        # =================================================
        structure_instruction = """
必ずJSONを返してください
"""

        formatted_base = (

            base_pc_prompt

            .replace(
                "{maker}",
                str(product.maker)
            )

            .replace(
                "{name}",
                str(product.name)
            )

            .replace(
                "{price}",
                f"{product.price or 0:,}"
            )

            .replace(
                "{description}",
                str(product.description or "")
            )
        )

        full_prompt = f"""

{formatted_base}

ブランド別ルール:
{brand_rules}

{structure_instruction}

"""

        api_url = (

            "https://generativelanguage.googleapis.com/"
            f"v1beta/models/{model_id}:generateContent"
            f"?key={current_api_key}"
        )

        try:

            response = requests.post(

                api_url,

                json={

                    "contents": [

                        {
                            "parts": [
                                {
                                    "text": full_prompt
                                }
                            ]
                        }
                    ],

                    "generationConfig": {
                        "temperature": 0.2
                    }
                },

                timeout=120
            )

            # =============================================
            # Retry
            # =============================================
            if response.status_code in [

                429,
                500,
                503,
                504

            ]:

                if retry_count < 3:

                    time.sleep(20)

                    return self.analyze_product(

                        product,
                        model_id,
                        count,
                        total,
                        retry_count + 1
                    )

                return

            response.raise_for_status()

            res_json = response.json()

            full_text = (

                res_json['candidates'][0]
                ['content']['parts'][0]['text']

            )

            # =============================================
            # JSON Parse
            # =============================================
            spec_data = {}

            spec_match = re.search(

                r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]',

                full_text,

                re.DOTALL
            )

            if spec_match:

                try:

                    clean_json = re.sub(

                        r'//.*',

                        '',

                        spec_match.group(1).strip()
                    )

                    spec_data = json.loads(

                        clean_json
                        .replace('、', ',')
                        .replace('：', ':')

                    )

                except Exception:

                    pass

            # =============================================
            # Summary
            # =============================================
            summary_match = re.search(

                r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]',

                full_text,

                re.DOTALL
            )

            summary_text = (

                summary_match.group(0).strip()

                if summary_match

                else ""
            )

            # =============================================
            # Clean Body
            # =============================================
            clean_body = re.sub(

                r'\[SPEC_JSON\].*?\[/SPEC_JSON\]',

                '',

                full_text,

                flags=re.DOTALL
            )

            clean_body = re.sub(

                r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]',

                '',

                clean_body,

                flags=re.DOTALL
            )

            clean_body = (

                clean_body

                .replace('<h2>', '## ')
                .replace('</h2>', '\n')

                .replace('<h3>', '### ')
                .replace('</h3>', '\n')

                .replace('<p>', '')
                .replace('</p>', '\n')

                .strip()
            )

            # =============================================
            # Safe Int
            # =============================================
            def safe_int(
                val,
                default=0
            ):

                try:

                    if isinstance(val, bool):

                        return int(val)

                    num = re.sub(

                        r'[^0-9]',

                        '',

                        str(val)
                    )

                    return (
                        int(num)
                        if num
                        else default
                    )

                except Exception:

                    return default

            # =============================================
            # Weight Parse
            # =============================================
            weight_text = " ".join([

                product.name or "",
                product.description or "",
                spec_data.get(
                    "display_info",
                    ""
                ),

            ])

            weight_match = re.search(

                r'(\d+(?:\.\d+)?)\s*kg',

                weight_text.lower()
            )

            if weight_match:

                try:

                    product.weight_kg = float(
                        weight_match.group(1)
                    )

                except Exception:

                    product.weight_kg = None

            # =============================================
            # DB Save
            # =============================================
            new_title = spec_data.get(
                'seo_title'
            )

            if (
                new_title
                and len(new_title) > 10
            ):

                product.name = new_title

            # =============================================
            # Spec Fields
            # =============================================
            product.cpu_model = spec_data.get(
                'cpu_model',
                product.cpu_model
            )

            product.gpu_model = spec_data.get(
                'gpu_model',
                product.gpu_model
            )

            product.memory_gb = safe_int(

                spec_data.get(
                    'memory_gb'
                ),

                product.memory_gb
            )

            product.storage_gb = safe_int(

                spec_data.get(
                    'storage_gb'
                ),

                product.storage_gb
            )

            product.display_info = spec_data.get(

                'display_info',

                product.display_info
            )

            product.npu_tops = safe_int(

                spec_data.get(
                    'npu_tops'
                ),

                product.npu_tops
            )

            product.target_segment = spec_data.get(

                'target_segment',

                product.target_segment
            )

            # =============================================
            # AI判定
            # =============================================
            # product.is_ai_pc = spec_data.get(
            #     'is_ai_pc',
            #     False
            # )

            # =============================================
            # AI Capability Inference
            # =============================================

            # -------------------------------------------------
            # Gemini AI Result (Soft Signal)
            # -------------------------------------------------

            product.is_ai_pc = spec_data.get(
                'is_ai_pc',
                False
            )

            # -------------------------------------------------
            # Deterministic AI Capability Scoring
            # -------------------------------------------------

            ai_capability_score = 0

            gpu = (
                product.gpu_model or ""
            ).lower()

            cpu = (
                product.cpu_model or ""
            ).lower()

            product_name = (
                product.name or ""
            ).lower()

            # -------------------------------------------------
            # RTX GPU Capability
            # -------------------------------------------------

            if "rtx 5090" in gpu:
                ai_capability_score += 50

            elif "rtx 5080" in gpu:
                ai_capability_score += 45

            elif "rtx 5070" in gpu:
                ai_capability_score += 40

            elif "rtx 4090" in gpu:
                ai_capability_score += 45

            elif "rtx 4080" in gpu:
                ai_capability_score += 40

            elif "rtx 4070" in gpu:
                ai_capability_score += 35

            elif "rtx 4060" in gpu:
                ai_capability_score += 25

            elif "rtx 4050" in gpu:
                ai_capability_score += 15

            # -------------------------------------------------
            # VRAM Capability
            # -------------------------------------------------

            vram_text = (
                product.display_info or ""
            ).lower()

            vram_match = re.search(
                r'(\d+)\s*gb',
                vram_text
            )

            if vram_match:

                try:

                    vram_gb = int(
                        vram_match.group(1)
                    )

                    if vram_gb >= 24:
                        ai_capability_score += 35

                    elif vram_gb >= 16:
                        ai_capability_score += 30

                    elif vram_gb >= 12:
                        ai_capability_score += 20

                    elif vram_gb >= 8:
                        ai_capability_score += 10

                except Exception:
                    pass

            # -------------------------------------------------
            # Memory Capability
            # -------------------------------------------------

            memory_gb = product.memory_gb or 0

            if memory_gb >= 64:
                ai_capability_score += 35

            elif memory_gb >= 32:
                ai_capability_score += 25

            elif memory_gb >= 16:
                ai_capability_score += 10

            # -------------------------------------------------
            # Storage Capability
            # -------------------------------------------------

            storage_gb = product.storage_gb or 0

            if storage_gb >= 2000:
                ai_capability_score += 10

            elif storage_gb >= 1000:
                ai_capability_score += 5

            # -------------------------------------------------
            # AI CPU / NPU Detection
            # -------------------------------------------------

            if "ryzen ai" in cpu:
                ai_capability_score += 35

            if "core ultra" in cpu:
                ai_capability_score += 25

            if "copilot+" in product_name:
                ai_capability_score += 30

            # -------------------------------------------------
            # AI Keywords (Boost Only)
            # -------------------------------------------------

            AI_KEYWORDS = [

                "ai pc",
                "local llm",
                "stable diffusion",
                "comfyui",
                "automatic1111",
                "ollama",
                "lm studio",
                "vllm",
                "text generation webui",
                "cuda",
                "tensor",
                "copilot+",
            ]

            full_text = " ".join([
                product.name or "",
                product.description or "",
                product.cpu_model or "",
                product.gpu_model or "",
                product.display_info or "",
            ]).lower()

            for keyword in AI_KEYWORDS:

                if keyword.lower() in full_text:
                    ai_capability_score += 10

            # -------------------------------------------------
            # Creator / Workstation Signal
            # -------------------------------------------------

            CREATOR_KEYWORDS = [
                "creator",
                "workstation",
                "studio",
                "proart",
                "zbook",
                "thinkpad p",
            ]

            for keyword in CREATOR_KEYWORDS:

                if keyword in full_text:
                    ai_capability_score += 12

            # -------------------------------------------------
            # Final AI Decision
            # -------------------------------------------------

            # Gemini が弱くても
            # deterministic capability が強ければ
            # AI workflow machine とみなす

            if ai_capability_score >= 40:

                product.is_ai_pc = True

            # -------------------------------------------------
            # Merge AI Score
            # -------------------------------------------------

            # product.score_ai = max(
            #     product.score_ai,
            #     ai_capability_score
            # )
            product.score_ai = max(

                safe_int(
                    spec_data.get('score_ai'),
                    0
                ),

                ai_capability_score
            )
            # -------------------------------------------------
            # AI Segment Enhancement
            # -------------------------------------------------

            if ai_capability_score >= 80:

                product.target_segment = (
                    "ai_workstation"
                )

            elif ai_capability_score >= 55:

                product.target_segment = (
                    "ai_creator"
                )

            elif ai_capability_score >= 40:

                if not product.target_segment:

                    product.target_segment = (
                        "ai_ready"
                    )
            

            # =============================================
            # Scores
            # =============================================
            product.score_cpu = safe_int(
                spec_data.get('score_cpu'),
                0
            )

            product.score_gpu = safe_int(
                spec_data.get('score_gpu'),
                0
            )

            product.score_cost = safe_int(
                spec_data.get('score_cost'),
                0
            )

            product.score_portable = safe_int(
                spec_data.get('score_portable'),
                0
            )

            product.score_ai = safe_int(
                spec_data.get('score_ai'),
                0
            )

            # =============================================
            # Meta
            # =============================================
            product.site_prefix = 'bicstation'

            product.is_active = True

            product.is_posted = True

            product.stock_status = "在庫あり"

            # =============================================
            # Spec Score
            # =============================================
            ai_spec_score = safe_int(
                spec_data.get(
                    'spec_score'
                ),
                0
            )

            product.spec_score = (

                ai_spec_score

                if ai_spec_score > 0

                else (

                    product.score_cpu
                    + product.score_gpu
                    + product.score_ai

                ) // 3
            )

            # =============================================
            # AI Content
            # =============================================
            product.ai_summary = summary_text

            product.ai_content = clean_body

            product.last_spec_parsed_at = (
                timezone.now()
            )

            # =============================================
            # SAVE
            # =============================================
            product.save()

            # =============================================
            # LOG
            # =============================================
            self.stdout.write(

                self.style.SUCCESS(

                    f" ✅ 更新完了 "
                    f"({count}/{total}) "
                    f"{product.unique_id}"

                )
            )

        except Exception as e:

            self.stdout.write(

                self.style.ERROR(

                    f"❌ 解析失敗 "
                    f"({product.unique_id}): "
                    f"{str(e)}"

                )
            )