# /home/maya/shin-vps/django/observation/common/dataset.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Observation Dataset

============================================================

Reality

        ↓

Observation Dataset

============================================================

Defines the standard Observation Dataset.

No Logic.

No Semantic.

No Evaluation.

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from dataclasses import dataclass, field

# --------------------------------------------------
# Observation Dataset
# --------------------------------------------------

@dataclass
class ObservationDataset:

    maker: str

    series: str

    product_count: int = 0

    sample_products: list[str] = field(
        default_factory=list,
    )

    cpu_families: list[str] = field(
        default_factory=list,
    )

    gpu_families: list[str] = field(
        default_factory=list,
    )

    memory_range: list[str] = field(
        default_factory=list,
    )

    storage_range: list[str] = field(
        default_factory=list,
    )

    npu_presence: list[str] = field(
        default_factory=list,
    )

    display_sizes: list[str] = field(
        default_factory=list,
    )

    price_min: int | None = None

    price_max: int | None = None

    observation_notes: str = ""