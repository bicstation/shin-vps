# -*- coding: utf-8 -*-

import json

from django.core.management.base import BaseCommand

from api.models import FanzaSampleMovie


class Command(BaseCommand):

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            "--limit",
            type=int,
            default=10,
        )

    def handle(
        self,
        *args,
        **options,
    ):

        limit = options["limit"]

        samples = (
            FanzaSampleMovie.objects
            .exclude(
                player_args_json__isnull=True
            )
            [:limit]
        )

        key_stats = {}

        total = 0
        failed = 0

        for movie in samples:

            try:

                data = (
                    movie.player_args_json
                )

                if not data:

                    continue

                if isinstance(
                    data,
                    str,
                ):

                    data = json.loads(
                        data
                    )

                if not isinstance(
                    data,
                    dict,
                ):

                    failed += 1

                    self.stdout.write(
                        self.style.WARNING(
                            f"[{movie.id}] "
                            f"Not Dict: "
                            f"{type(data)}"
                        )
                    )

                    continue

            except Exception as e:

                failed += 1

                self.stdout.write(
                    self.style.ERROR(
                        f"[{movie.id}] "
                        f"{type(e).__name__}: "
                        f"{str(e)[:200]}"
                    )
                )

                continue

            total += 1

            for key in data.keys():

                key_stats[key] = (
                    key_stats.get(
                        key,
                        0,
                    ) + 1
                )

        self.stdout.write("")
        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            f"Survey Success : {total}"
        )

        self.stdout.write(
            f"Survey Failed  : {failed}"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write("")

        for key, count in sorted(
            key_stats.items(),
            key=lambda x: x[1],
            reverse=True,
        ):

            self.stdout.write(
                f"{key:<35} "
                f"{count}/{total}"
            )

        self.stdout.write("")