# ============================================================================
# FILE:
# acquisition/common/trace/reality_trace.py
# ============================================================================

from __future__ import annotations

from pprint import pprint
from typing import Any

# ============================================================================
# Runtime
# ============================================================================

TRACE_ENABLED = True

# None = Trace Everything
TRACE_PRODUCT_NO: str | None = "72002746"

# ============================================================================
# Extractors
# ============================================================================

def _extract_product_no(data: Any) -> str:

    #
    # Django Model
    #

    if not isinstance(data, dict):
        return str(getattr(data, "product_no", "") or "")

    #
    # Formatter Runtime
    #

    if data.get("product_no"):
        return str(data["product_no"])

    #
    # Integration Contract
    #

    identity = data.get("identity")

    if isinstance(identity, dict):

        if identity.get("product_no"):
            return str(identity["product_no"])

    #
    # Builder Runtime
    #

    if data.get("product_no"):
        return str(data["product_no"])

    return ""


def _extract_pc_id(data: Any) -> str:

    if not isinstance(data, dict):
        return str(getattr(data, "pc_id", "") or "")

    if data.get("pc_id"):
        return str(data["pc_id"])

    identity = data.get("identity")

    if isinstance(identity, dict):

        if identity.get("pc_id"):
            return str(identity["pc_id"])

    return ""


def _extract_unique_id(data: Any) -> str:

    if not isinstance(data, dict):
        return str(getattr(data, "unique_id", "") or "")

    if data.get("unique_id"):
        return str(data["unique_id"])

    identity = data.get("identity")

    if isinstance(identity, dict):

        if identity.get("unique_id"):
            return str(identity["unique_id"])

    return ""


# ============================================================================
# Filter
# ============================================================================

def _is_target(data: Any) -> bool:

    if not TRACE_ENABLED:
        return False

    if TRACE_PRODUCT_NO is None:
        return True

    product_no = _extract_product_no(data)

    if product_no == TRACE_PRODUCT_NO:
        return True

    pc_id = _extract_pc_id(data)

    if pc_id == TRACE_PRODUCT_NO:
        return True

    unique_id = _extract_unique_id(data)

    if unique_id.endswith(TRACE_PRODUCT_NO):
        return True

    return False


# ============================================================================
# Trace
# ============================================================================

def trace(stage: str, data: Any) -> None:

    if not _is_target(data):
        return

    print()
    print("=" * 80)
    print(f"🌌 REALITY TRACE :: {stage}")
    print("=" * 80)

    if isinstance(data, dict):

        for key in sorted(data.keys()):
            print(f"{key:<30}: {repr(data[key])}")

    else:
        pprint(data)

    print("=" * 80)
    print()


# ============================================================================
# Django Model
# ============================================================================

def trace_model(stage: str, obj: Any) -> None:

    if not _is_target(obj):
        return

    print()
    print("=" * 80)
    print(f"🌌 REALITY TRACE MODEL :: {stage}")
    print("=" * 80)

    for field in obj._meta.fields:

        value = getattr(obj, field.name)

        print(f"{field.name:<30}: {repr(value)}")

    print("=" * 80)
    print()