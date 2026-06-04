# -*- coding: utf-8 -*-
# api/utils/semantic/extraction/extract_adult_reality.py

from api.models import (
    FanzaSampleMovie,
)


def extract_adult_reality(

    product,

    trace_runtime=False,

):
    """
    Adult Reality Extraction

    Responsibility:

        AdultProduct
            ↓
        Reality Tokens

    NOTE:

        Semantic解決しない
        Alias解決しない
        Group解決しない

        Reality収集のみ
    """

    # =====================================================
    # BASIC
    # =====================================================

    title = str(
        getattr(
            product,
            "title",
            "",
        ) or ""
    )

    description = str(
        getattr(
            product,
            "product_description",
            "",
        ) or ""
    )

    # =====================================================
    # GENRES
    # =====================================================

    genres = []

    try:

        genres = [

            str(
                genre.name
            ).strip()

            for genre in (
                product.genres.all()
            )
        ]

    except Exception:

        pass

    # =====================================================
    # SERIES
    # =====================================================

    series = []

    try:

        series_obj = getattr(
            product,
            "series",
            None,
        )

        if series_obj:

            series.append(
                str(
                    series_obj.name
                ).strip()
            )

    except Exception:

        pass

    # =====================================================
    # LABEL
    # =====================================================

    labels = []

    try:

        label_obj = getattr(
            product,
            "label",
            None,
        )

        if label_obj:

            labels.append(
                str(
                    label_obj.name
                ).strip()
            )

    except Exception:

        pass

    # =====================================================
    # DIRECTOR
    # =====================================================

    directors = []

    try:

        director_obj = getattr(
            product,
            "director",
            None,
        )

        if director_obj:

            directors.append(
                str(
                    director_obj.name
                ).strip()
            )

    except Exception:

        pass

    # =====================================================
    # ACTRESSES
    # =====================================================

    actresses = []

    try:

        actresses = [

            str(
                actress.name
            ).strip()

            for actress in (
                product.actresses.all()
            )
        ]

    except Exception:

        pass

    # =====================================================
    # PREVIEW REALITY
    # =====================================================

    preview_tokens = []

    try:

        preview = (
            FanzaSampleMovie.objects
            .filter(
                adult_product=product
            )
            .first()
        )

        if preview:

            if preview.sample_movie_url:

                preview_tokens.append(
                    "sample_movie_url"
                )

            if preview.html_snapshot:

                preview_tokens.append(
                    "html_snapshot"
                )

            if preview.player_url:

                preview_tokens.append(
                    "player_url"
                )

            if preview.player_args_json:

                preview_tokens.append(
                    "player_args_json"
                )

    except Exception:

        pass

    # =====================================================
    # SOURCE TEXT
    # =====================================================

    source_text = " ".join([

        title,

        description,

        " ".join(genres),

        " ".join(series),

        " ".join(labels),

        " ".join(directors),

        " ".join(actresses),

        " ".join(preview_tokens),

    ]).lower()

    # =====================================================
    # REALITY
    # =====================================================

    reality = {

        "source_text":
            source_text,

        "genres":
            genres,

        "series":
            series,

        "labels":
            labels,

        "directors":
            directors,

        "actresses":
            actresses,

        "preview":
            preview_tokens,
    }

    return reality