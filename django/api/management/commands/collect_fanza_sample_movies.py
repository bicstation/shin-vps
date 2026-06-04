# -*- coding: utf-8 -*-

import json

from django.core.management.base import BaseCommand

from api.models import RawApiData
from api.utils.adult.fanza_sample_movie_collector import (
    FanzaSampleMovieCollector,
)


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        raw = (
            RawApiData.objects
            .filter(
                api_source="fanza",
                api_floor="videoa",
            )
            .order_by("-id")
            .first()
        )

        if not raw:

            self.stdout.write(
                self.style.ERROR(
                    "RawApiData not found"
                )
            )

            return

        payload = json.loads(
            raw.raw_json_data
        )

        items = (
            payload
            .get("result", {})
            .get("items", [])
        )

        collector = (
            FanzaSampleMovieCollector()
        )

        collected = 0
        skipped = 0

        for item in items:

            if not item.get(
                "sampleMovieURL"
            ):

                skipped += 1
                continue

            repository = (
                collector.collect_from_raw_item(
                    item
                )
            )

            if repository:

                collected += 1

            else:

                skipped += 1

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "FANZA Sample Movie Collection Finished"
            )
        )

        self.stdout.write(
            f"Collected : {collected}"
        )

        self.stdout.write(
            f"Skipped   : {skipped}"
        )

        self.stdout.write(
            f"Total     : {len(items)}"
        )

        self.stdout.write("")