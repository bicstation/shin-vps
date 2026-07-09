# -*- coding: utf-8 -*-
# api/services/semantic/v2/inventory/export_alias_products.py

import csv
from pathlib import Path

from django.conf import settings

from api.models import (
    PCProduct,
)


# ==========================================================
# EXPORT ALIAS PRODUCTS
# ==========================================================

def export_alias_products(
    output_path=None,
):
    """
    Alias Research Team 用 TSV を生成する

    Columns
    -------
    unique_id
    maker
    name

    Returns
    -------
    str
        出力した TSV ファイルのパス
    """

    if output_path is None:

        output_path = (
            Path(settings.BASE_DIR)
            / "exports"
            / "alias-products.tsv"
        )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    queryset = (
        PCProduct.objects
        .all()
        .order_by("-updated_at")
    )

    with open(
        output_path,
        "w",
        encoding="utf-8",
        newline="",
    ) as fp:

        writer = csv.writer(
            fp,
            delimiter="\t",
        )

        # Header
        writer.writerow([
            "unique_id",
            "maker",
            "name",
        ])

        for product in queryset:

            writer.writerow([

                product.unique_id,

                product.maker,

                product.name,

            ])

    return str(output_path)