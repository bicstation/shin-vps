# /home/maya/shin-vps/django/observation/generators/manufacturer_series/collector.py

"""
============================================================

SHIN CORE LINX
Observation Platform
Manufacturer Series Collector

============================================================

Reality

        ↓

Observation Dataset

============================================================

Collects Observation Data.

No Semantic.
No Evaluation.
No Runtime.

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from collections import defaultdict
from .extractor import (    extract_series,)
from .finalizer import (    finalize_dataset,)

# --------------------------------------------------
# Collect Observation Dataset
# --------------------------------------------------

def collect_observation_dataset(

    products,

):

    """
    Build Manufacturer Series Observation Dataset.

    Parameters
    ----------
    products : QuerySet[PCProduct]

    Returns
    -------
    list[dict]
    """

    observations = defaultdict(

        lambda: {

            "maker": "",
            "series": "",
            "product_count": 0,
            "sample_products": [],
            "cpu_families": set(),
            "gpu_families": set(),
            "memory_range": set(),
            "storage_range": set(),
            "npu_presence": set(),
            "display_sizes": set(),
            "price_values": [],
            "observation_notes": "",

        }

    )


    # ------------------------------------------
    # Reality Observation
    # ------------------------------------------

    for product in products:

        #
        # Reality
        #

        maker = (

            product.maker

            or ""

        ).strip()

        #
        # Series Observation
        #

        series = extract_series(
            product.name,
        )

        key = (
            maker,
            series,
        )

        record = observations[key]

        record["maker"] = maker

        record["series"] = series

        record["product_count"] += 1

        #
        # Sample Products
        #

        if len(

            record["sample_products"]

        ) < 10:

            record["sample_products"].append(

                product.name

            )

        #
        # CPU
        #

        cpu_model = getattr(
            product,
            "cpu_model",
            None,
        )

        if cpu_model:

            record["cpu_families"].add(
                cpu_model,
            )

        #
        # GPU
        #

        gpu_model = getattr(
            product,
            "gpu_model",
            None,
        )

        if gpu_model:

            record["gpu_families"].add(
                gpu_model,
            )

        #
        # Memory
        #

        memory_gb = getattr(
            product,
            "memory_gb",
            None,
        )

        if memory_gb is not None:

            record["memory_range"].add(
                str(memory_gb),
            )

        #
        # Storage
        #

        storage_gb = getattr(
            product,
            "storage_gb",
            None,
        )

        if storage_gb is not None:

            record["storage_range"].add(
                str(storage_gb),
            )

        #
        # NPU
        #

        npu_tops = getattr(
            product,
            "npu_tops",
            None,
        )

        if npu_tops is not None:

            record["npu_presence"].add(
                str(npu_tops),
            )

        #
        # Display
        #

        display_info = getattr(
            product,
            "display_info",
            None,
        )

        if display_info:

            record["display_sizes"].add(
                display_info,
            )
            
        # ==========================================
        # Reality Debug
        # ==========================================

        if series == "ROG":

            print()
            print("=" * 60)
            print("Reality Debug")
            print("=" * 60)

            print("Name     :", product.name)
            print("Maker    :", maker)
            print("Series   :", series)

            print("CPU      :", getattr(product, "cpu_model", None))
            print("GPU      :", getattr(product, "gpu_model", None))
            print("Memory   :", getattr(product, "memory_gb", None))
            print("Storage  :", getattr(product, "storage_gb", None))
            print("Display  :", getattr(product, "display_info", None))
            print("NPU      :", getattr(product, "npu_tops", None))
            print("Price    :", getattr(product, "price", None))

            print("=" * 60)
            print()

        #
        # Price
        #

        if getattr(

            product,

            "price",

            None,

        ):

            record["price_values"].append(

                product.price

            )

    return finalize_dataset(
        observations,
    )