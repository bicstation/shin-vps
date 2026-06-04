# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/sync_fanza_preview_reality.py

import json

from django.core.management.base import BaseCommand

from api.models import RawApiData
from api.utils.adult.fanza_sample_movie_collector import (
    FanzaSampleMovieCollector,
)


class Command(BaseCommand):

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            "--limit",
            type=int,
            default=100,
            help="Maximum items to process",
        )

    def handle(
        self,
        *args,
        **options,
    ):

        limit = options["limit"]

        raws = (
            RawApiData.objects
            .filter(
                api_source="fanza",
                api_floor="videoa",
            )
            .order_by("-id")
        )

        raw_count = raws.count()

        if raw_count == 0:

            self.stdout.write(
                self.style.ERROR(
                    "RawApiData not found"
                )
            )

            return

        self.stdout.write("")
        self.stdout.write(
            f"RawApiData Count : {raw_count}"
        )
        self.stdout.write(
            f"Process Limit    : {limit}"
        )
        self.stdout.write("")

        collector = (
            FanzaSampleMovieCollector()
        )

        collected = 0
        skipped = 0
        not_found = 0
        errors = 0
        processed = 0

        for raw in raws:

            if processed >= limit:
                break

            try:

                payload = json.loads(
                    raw.raw_json_data
                )

            except Exception as e:

                errors += 1

                self.stdout.write(
                    self.style.WARNING(
                        f"JSON ERROR: {e}"
                    )
                )

                continue

            items = (
                payload
                .get("result", {})
                .get("items", [])
            )

            for item in items:

                if processed >= limit:
                    break

                processed += 1

                if processed % 100 == 0:

                    self.stdout.write(
                        f"[PROGRESS] "
                        f"{processed}/{limit}"
                    )

                if not item.get(
                    "sampleMovieURL"
                ):

                    skipped += 1
                    continue

                try:

                    repository = (
                        collector.collect_from_raw_item(
                            item
                        )
                    )

                    if repository:

                        collected += 1

                    else:

                        not_found += 1

                except Exception as e:

                    errors += 1

                    self.stdout.write(
                        self.style.WARNING(
                            f"ERROR: {e}"
                        )
                    )

        self.stdout.write("")
        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            self.style.SUCCESS(
                "FANZA Preview Reality Sync Finished"
            )
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            f"Collected : {collected}"
        )

        self.stdout.write(
            f"Not Found : {not_found}"
        )

        self.stdout.write(
            f"Skipped   : {skipped}"
        )

        self.stdout.write(
            f"Errors    : {errors}"
        )

        self.stdout.write(
            f"Processed : {processed}"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write("")