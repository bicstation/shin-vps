# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/normalizers.py

import re


# ==========================================================
# GENERIC
# ==========================================================

def clean_text(text):

    if not text:
        return ""

    return str(text).strip()


def normalize_spaces(text):

    text = clean_text(text)

    return re.sub(
        r'\s+',
        ' ',
        text
    ).strip()


# ==========================================================
# CPU NORMALIZATION
# ==========================================================

CPU_NORMALIZATION_RULES = [

    # Intel Core Ultra
    (
        r'Core\s?Ultra\s?([3579])',
        r'Core Ultra \1'
    ),

    # Intel Core i
    (
        r'Core\s?i([3579])',
        r'Core i\1'
    ),

    # Intel Core 5/7
    (
        r'Core\s?([3579])',
        r'Core \1'
    ),

    # Ryzen
    (
        r'Ryzen\s?([3579])',
        r'Ryzen \1'
    ),

    # Ryzen AI
    (
        r'Ryzen\s?AI',
        r'Ryzen AI'
    ),

    # Snapdragon
    (
        r'Snapdragon\s?X\s?Elite',
        r'Snapdragon X Elite'
    ),

    (
        r'Snapdragon\s?X\s?Plus',
        r'Snapdragon X Plus'
    ),
]


def normalize_cpu(cpu):

    cpu = clean_text(cpu)

    if not cpu:
        return None

    normalized = cpu

    for pattern, replacement in CPU_NORMALIZATION_RULES:

        normalized = re.sub(
            pattern,
            replacement,
            normalized,
            flags=re.I
        )

    return normalize_spaces(normalized)


# ==========================================================
# GPU NORMALIZATION
# ==========================================================

GPU_NORMALIZATION_RULES = [

    # RTX
    (
        r'RTX\s?(\d{4})',
        r'RTX \1'
    ),

    # GTX
    (
        r'GTX\s?(\d{3,4})',
        r'GTX \1'
    ),

    # Radeon RX
    (
        r'RX\s?(\d{4,5})',
        r'RX \1'
    ),

    # Intel Arc
    (
        r'Arc\s?([A-Z]?\d+)',
        r'Arc \1'
    ),
]


def normalize_gpu(gpu):

    gpu = clean_text(gpu)

    if not gpu:
        return None

    normalized = gpu

    for pattern, replacement in GPU_NORMALIZATION_RULES:

        normalized = re.sub(
            pattern,
            replacement,
            normalized,
            flags=re.I
        )

    return normalize_spaces(normalized)


# ==========================================================
# DISPLAY NORMALIZATION
# ==========================================================

DISPLAY_NORMALIZATION_RULES = [

    (
        r'qd-oled',
        'QD-OLED'
    ),

    (
        r'oled',
        'OLED'
    ),

    (
        r'mini\s?led',
        'Mini LED'
    ),

    (
        r'ips',
        'IPS'
    ),

    (
        r'va',
        'VA'
    ),
]


def normalize_display(display):

    display = clean_text(display)

    if not display:
        return None

    normalized = display

    for pattern, replacement in DISPLAY_NORMALIZATION_RULES:

        normalized = re.sub(
            pattern,
            replacement,
            normalized,
            flags=re.I
        )

    return normalize_spaces(normalized)


# ==========================================================
# PRODUCT TYPE NORMALIZATION
# ==========================================================

PRODUCT_TYPE_MAP = {

    # ==============================================
    # Monitor
    # ==============================================
    "display":
        "monitor",

    "gaming monitor":
        "monitor",

    # ==============================================
    # Software
    # ==============================================
    "app":
        "software",

    "application":
        "software",

    # ==============================================
    # PC
    # ==============================================
    "laptop":
        "pc",

    "desktop":
        "pc",
}


def normalize_product_type(product_type):

    product_type = clean_text(product_type).lower()

    if not product_type:
        return "pc"

    if product_type in PRODUCT_TYPE_MAP:

        return PRODUCT_TYPE_MAP[
            product_type
        ]

    return product_type


# ==========================================================
# MEMORY NORMALIZATION
# ==========================================================

def normalize_memory(memory):

    if memory is None:
        return None

    try:
        return int(memory)

    except:
        return None


# ==========================================================
# STORAGE NORMALIZATION
# ==========================================================

def normalize_storage(storage):

    if storage is None:
        return None

    try:
        return int(storage)

    except:
        return None


# ==========================================================
# REFRESH RATE NORMALIZATION
# ==========================================================

def normalize_refresh_rate(rate):

    if rate is None:
        return None

    try:
        return int(rate)

    except:
        return None


# ==========================================================
# SEMANTIC RUNTIME NORMALIZATION
# ==========================================================

def normalize_semantic_runtime(runtime):

    if not runtime:
        return {}

    return {

        # ==============================================
        # CPU
        # ==============================================
        "cpu_model":
            normalize_cpu(
                runtime.get("cpu_model")
            ),

        # ==============================================
        # GPU
        # ==============================================
        "gpu_model":
            normalize_gpu(
                runtime.get("gpu_model")
            ),

        # ==============================================
        # Memory
        # ==============================================
        "memory_gb":
            normalize_memory(
                runtime.get("memory_gb")
            ),

        # ==============================================
        # Storage
        # ==============================================
        "storage_gb":
            normalize_storage(
                runtime.get("storage_gb")
            ),

        # ==============================================
        # Display
        # ==============================================
        "display_type":
            normalize_display(
                runtime.get("display_type")
            ),

        # ==============================================
        # Refresh Rate
        # ==============================================
        "refresh_rate":
            normalize_refresh_rate(
                runtime.get("refresh_rate")
            ),

        # ==============================================
        # Product Type
        # ==============================================
        "product_type":
            normalize_product_type(
                runtime.get("product_type")
            ),
    }