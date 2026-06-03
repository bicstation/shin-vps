# -*- coding: utf-8 -*-
import json
import logging
import requests
import re
from django.utils import timezone

from api.models import (AdultProduct,FanzaSampleMovie,)

logger = logging.getLogger(__name__)


class FanzaSampleMovieCollector:
    """
    FANZA Preview Reality Collector

    Responsibility:

        RawApiData item
            ↓
        sampleMovieURL
            ↓
        AdultProduct(api_product_id)
            ↓
        litevideo HTML
            ↓
        FanzaSampleMovie

    NOTE:
        Runtimeではない。
        評価もしない。

        Reality Repository 構築専用。
    """

    def collect_from_raw_item(self, item):
        """
        RawApiData item 1件を処理

        Returns:
            FanzaSampleMovie | None
        """

        content_id = item.get("content_id")

        if not content_id:
            return None

        sample_movie = item.get("sampleMovieURL")

        if not sample_movie:
            return None

        adult_product = (
            AdultProduct.objects
            .filter(
                api_product_id=content_id
            )
            .first()
        )

        if not adult_product:

            logger.warning(
                "AdultProduct not found: %s",
                content_id,
            )

            return None

        sample_movie_url = (
            sample_movie.get("size_720_480")
            or sample_movie.get("size_644_414")
            or sample_movie.get("size_560_360")
            or sample_movie.get("size_476_306")
            or ""
        )

        repository, _ = (
            FanzaSampleMovie.objects
            .get_or_create(
                adult_product=adult_product
            )
        )

        html_snapshot = (
            self.fetch_html_snapshot(
                sample_movie_url
            )
        )

        player_url = (
            self.extract_player_url(
                html_snapshot
            )
        )
        
        player_html = (
            self.fetch_player_html(
                player_url
            )
        )

        player_args_json = (
            self.extract_player_args_json(
                player_html
            )
        )

        repository.sample_movie_url = (
            sample_movie_url
        )

        repository.html_snapshot = (
            html_snapshot or ""
        )

        repository.player_url = (
            player_url
        )
        
        repository.player_args_json = (
            player_args_json
        )

        if player_args_json:

            repository.fetch_status = (
                "PLAYER_ARGS_COLLECTED"
            )

        elif html_snapshot:

            repository.fetch_status = (
                "HTML_COLLECTED"
            )

        else:

            repository.fetch_status = (
                "HTML_FETCH_FAILED"
            )


        repository.last_checked_at = (
            timezone.now()
        )

        repository.save()

        return repository

    def collect_from_items(self, items):
        """
        RawApiData.result.items を処理
        """

        collected = 0

        for item in items:

            result = (
                self.collect_from_raw_item(
                    item
                )
            )

            if result:
                collected += 1

        return collected

    def fetch_html_snapshot(
        self,
        sample_movie_url,
    ):
        """
        litevideo HTML を取得

        Returns:
            str | None
        """

        if not sample_movie_url:
            return None

        try:

            response = requests.get(
                sample_movie_url,
                timeout=30,
                headers={
                    "User-Agent":
                        "Mozilla/5.0"
                },
            )

            response.raise_for_status()

            return response.text

        except Exception:

            logger.exception(
                "HTML fetch failed: %s",
                sample_movie_url,
            )

            return None   
    
    def extract_player_url(
        self,
        html_snapshot,
    ):
        """
        html_snapshot から
        iframe src を抽出する

        Returns:
            str
        """

        if not html_snapshot:
            return ""

        match = re.search(
            r'<iframe[^>]*src="([^"]+)"',
            html_snapshot,
            re.IGNORECASE | re.DOTALL,
        )
        
        if not match:
            return ""

        return match.group(1)
    
    def fetch_player_html(
        self,
        player_url,
    ):
        """
        html5_player HTML を取得

        Returns:
            str | None
        """

        if not player_url:
            return None

        try:

            response = requests.get(
                player_url,
                timeout=30,
                headers={
                    "User-Agent":
                        "Mozilla/5.0"
                },
            )

            response.raise_for_status()

            return response.text

        except Exception:

            logger.exception(
                "Player HTML fetch failed: %s",
                player_url,
            )

            return None

    def extract_player_args_json(
        self,
        player_html,
    ):
        """
        html5_player HTML から
        const args = {...};
        の JSON 本体を抽出する

        Returns:
            str | None
        """

        if not player_html:
            return None

        marker = "const args ="

        start = player_html.find(
            marker
        )

        if start == -1:
            return None

        start = player_html.find(
            "{",
            start,
        )

        if start == -1:
            return None

        depth = 0
        in_string = False
        escaped = False

        for i in range(
            start,
            len(player_html),
        ):

            ch = player_html[i]

            if escaped:

                escaped = False
                continue

            if ch == "\\":

                escaped = True
                continue

            if ch == '"':

                in_string = (
                    not in_string
                )

                continue

            if in_string:
                continue

            if ch == "{":

                depth += 1

            elif ch == "}":

                depth -= 1

                if depth == 0:

                    return (
                        player_html[
                            start:i + 1
                        ]
                    )

        return None

