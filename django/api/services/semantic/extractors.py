# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/extractors.py

import re


# ==========================================================
# CPU PATTERNS
# ==========================================================

CPU_PATTERNS = [

    # ------------------------------------------------------
    # Intel Core Ultra
    # ------------------------------------------------------
    r'Core\s?Ultra\s?\d+',

    # ------------------------------------------------------
    # Intel Core i
    # ------------------------------------------------------
    r'Core\s?i[3579]',

    # ------------------------------------------------------
    # Intel Core 5 / 7
    # ------------------------------------------------------
    r'Core\s?[3579]',

    # ------------------------------------------------------
    # AMD Ryzen
    # ------------------------------------------------------
    r'Ryzen\s?[3579]',

    # ------------------------------------------------------
    # Ryzen AI
    # ------------------------------------------------------
    r'Ryzen\s?AI',

    # ------------------------------------------------------
    # Snapdragon
    # ------------------------------------------------------
    r'Snapdragon\s?X\s?Elite',
    r'Snapdragon\s?X\s?Plus',
]


# ==========================================================
# GPU PATTERNS
# ==========================================================

GPU_PATTERNS = [

    # ------------------------------------------------------
    # NVIDIA
    # ------------------------------------------------------
    r'RTX\s?\d{4}',
    r'GTX\s?\d{3,4}',

    # ------------------------------------------------------
    # AMD
    # ------------------------------------------------------
    r'RX\s?\d{4,5}',

    # ------------------------------------------------------
    # Intel Arc
    # ------------------------------------------------------
    r'Arc\s?[A-Z]?\d+',
]


# ==========================================================
# DISPLAY PATTERNS
# ==========================================================

DISPLAY_PATTERNS = [

    # ------------------------------------------------------
    # OLED
    # ------------------------------------------------------
    r'QD-OLED',
    r'\bOLED\b',

    # ------------------------------------------------------
    # Mini LED
    # ------------------------------------------------------
    r'Mini\s?LED',

    # ------------------------------------------------------
    # LCD
    # ------------------------------------------------------
    r'\bIPS\b',
    r'\bVA\b',
]


# ==========================================================
# PRODUCT TYPE RULES
# ==========================================================

PRODUCT_TYPE_RULES = {

    # ======================================================
    # Monitor
    # ======================================================
    "monitor": [

        "monitor",
        "モニター",

        "oled",
        "qd-oled",

        "240hz",
        "360hz",

        "displayport",
        "hdmi",
    ],

    # ======================================================
    # Software
    # ======================================================
    "software": [

        "office",
        "windows",
        "adobe",

        "ダウンロード版",
        "pdf",
        "ライセンス",
    ],

    # ======================================================
    # Accessories
    # ======================================================
    "accessory": [

        "cleaner",
        "screen cleaner",

        "cable",
        "adapter",

        "webcam",
        "microphone",

        "mouse",
        "keyboard",

        "スタンド",
        "クリーナー",
    ],

    # ======================================================
    # PC
    # ======================================================
    "pc": [

        "laptop",
        "notebook",
        "desktop",

        "gaming pc",

        "workstation",

        "omen",
        "thinkpad",
        "pavilion",
    ]
}


# ==========================================================
# CLEAN TEXT
# ==========================================================

def clean_text(text):

    if not text:
        return ""

    return str(text).strip()


# ==========================================================
# GENERIC PATTERN EXTRACT
# ==========================================================

def extract_by_patterns(text, patterns):

    text = clean_text(text)

    if not text:
        return None

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:
            return match.group(0)

    return None


# ==========================================================
# PRODUCT TYPE
# IMPORTANT:
# Must execute FIRST
# ==========================================================

def extract_product_type(text):

    text = clean_text(text).lower()

    if not text:
        return "pc"

    # ------------------------------------------------------
    # Priority Order Important
    # ------------------------------------------------------

    priority_order = [

        "software",
        "accessory",
        "monitor",
        "pc",
    ]

    for product_type in priority_order:

        keywords = PRODUCT_TYPE_RULES.get(
            product_type,
            []
        )

        for keyword in keywords:

            if keyword.lower() in text:
                return product_type

    return "pc"


# ==========================================================
# CPU
# ==========================================================

def extract_cpu(text):

    return extract_by_patterns(
        text,
        CPU_PATTERNS
    )


# ==========================================================
# GPU
# ==========================================================

def extract_gpu(text):

    return extract_by_patterns(
        text,
        GPU_PATTERNS
    )


# ==========================================================
# STORAGE
# ==========================================================

def extract_storage(
    text,
    product_type=None
):

    """
    Examples:
    512GB SSD
    1TB SSD
    2TB SSD
    """

    text = clean_text(text)

    if not text:
        return None

    # ------------------------------------------------------
    # Ignore non-PC
    # ------------------------------------------------------

    if product_type in [

        "monitor",
        "software",
        "accessory",
    ]:
        return None

    patterns = [

        r'(\d+)\s?TB\s?SSD',
        r'(\d+)\s?GB\s?SSD',

        r'(\d+)\s?TB\s?NVME',
        r'(\d+)\s?GB\s?NVME',
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:

            value = match.group(1)

            # --------------------------------------------------
            # TB → GB
            # --------------------------------------------------

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


# ==========================================================
# MEMORY
# ==========================================================

def extract_memory(
    text,
    product_type=None
):

    """
    Context-aware memory extraction
    Avoid:
    - monitor specs
    - model numbers
    - SSD contamination
    - accessory contamination
    """

    text = clean_text(text)

    if not text:
        return None

    # ------------------------------------------------------
    # Ignore non-PC runtime
    # ------------------------------------------------------

    if product_type in [

        "monitor",
        "software",
        "accessory",
    ]:
        return None

    # ------------------------------------------------------
    # SSD removal
    # ------------------------------------------------------

    cleaned = re.sub(
        r'\d+\s?(GB|TB)\s?(SSD|NVME)',
        '',
        text,
        flags=re.I
    )

    # ------------------------------------------------------
    # Strict RAM Context
    # ------------------------------------------------------

    patterns = [

        r'(\d+)\s?GB\s?(RAM|MEMORY|DDR|DDR4|DDR5)',

        r'(RAM|MEMORY|DDR|DDR4|DDR5)\s?(\d+)\s?GB',

        r'(\d+)\s?GB\s?メモリ',

        r'メモリ\s?(\d+)\s?GB',
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            cleaned,
            re.I
        )

        if match:

            try:

                numbers = re.findall(
                    r'\d+',
                    match.group(0)
                )

                if not numbers:
                    continue

                value = int(numbers[0])

                # ----------------------------------------------
                # Sanity Check
                # ----------------------------------------------

                if value < 2:
                    continue

                if value > 512:
                    continue

                return value

            except:
                continue

    return None


# ==========================================================
# DISPLAY TYPE
# ==========================================================

def extract_display_type(text):

    return extract_by_patterns(
        text,
        DISPLAY_PATTERNS
    )


# ==========================================================
# REFRESH RATE
# ==========================================================

def extract_refresh_rate(
    text,
    product_type=None
):

    text = clean_text(text)

    if not text:
        return None

    # ------------------------------------------------------
    # Mostly monitor-related
    # ------------------------------------------------------

    if product_type not in [
        "monitor",
    ]:
        return None

    match = re.search(
        r'(\d+)\s?Hz',
        text,
        re.I
    )

    if match:

        try:

            value = int(match.group(1))

            # --------------------------------------------------
            # Sanity
            # --------------------------------------------------

            if value < 30:
                return None

            if value > 1000:
                return None

            return value

        except:
            return None

    return None


# ==========================================================
# SEMANTIC RUNTIME
# ==========================================================

def build_semantic_runtime(text):

    """
    text
    ↓
    structured semantic runtime
    """

    # ======================================================
    # Product Type FIRST
    # ======================================================

    product_type = extract_product_type(
        text
    )

    # ======================================================
    # Runtime
    # ======================================================

    return {

        # ==============================================
        # Core Specs
        # ==============================================
        "cpu_model":
            extract_cpu(text),

        "gpu_model":
            extract_gpu(text),

        "memory_gb":
            extract_memory(
                text,
                product_type,
            ),

        "storage_gb":
            extract_storage(
                text,
                product_type,
            ),

        # ==============================================
        # Display
        # ==============================================
        "display_type":
            extract_display_type(text),

        "refresh_rate":
            extract_refresh_rate(
                text,
                product_type,
            ),

        # ==============================================
        # Product Runtime
        # ==============================================
        "product_type":
            product_type,
    }