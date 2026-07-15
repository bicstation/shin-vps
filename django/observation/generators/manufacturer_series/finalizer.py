# /home/maya/shin-vps/django/observation/generators/manufacturer_series/finalizer.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Manufacturer Series Finalizer

============================================================

Observation Records

        ↓

Observation Dataset

============================================================

Finalize Observation Dataset.

No Reality Access.

No Semantic.

No Evaluation.

============================================================
"""

# --------------------------------------------------
# Finalize Dataset
# --------------------------------------------------

def finalize_dataset(

    observations,

):

    """
    Finalize Observation Dataset.

    Parameters
    ----------
    observations : dict

    Returns
    -------
    list[dict]
    """

    dataset = []

    for record in observations.values():

        #
        # Price
        #

        prices = record.pop(

            "price_values",

        )

        record["price_min"] = (

            min(prices)

            if prices

            else None

        )

        record["price_max"] = (

            max(prices)

            if prices

            else None

        )

        #
        # Set -> List
        #

        record["cpu_families"] = sorted(

            record["cpu_families"]

        )

        record["gpu_families"] = sorted(

            record["gpu_families"]

        )

        record["memory_range"] = sorted(

            record["memory_range"]

        )

        record["storage_range"] = sorted(

            record["storage_range"]

        )

        record["npu_presence"] = sorted(

            record["npu_presence"]

        )

        record["display_sizes"] = sorted(

            record["display_sizes"]

        )

        dataset.append(

            record,

        )

    return sorted(

        dataset,

        key=lambda x: (

            x["maker"],

            x["series"],

        ),

    )