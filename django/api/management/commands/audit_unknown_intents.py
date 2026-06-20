# -*- coding: utf-8 -*-

import json

from pathlib import Path

from collections import Counter

from django.core.management.base import (
    BaseCommand,
)


# ==========================================================
# COMMAND
# ==========================================================

class Command(BaseCommand):

    help = (
        "Audit Unknown Intent Logs"
    )

    # ======================================================
    # HANDLE
    # ======================================================

    def handle(

        self,

        *args,

        **options,

    ):

        # --------------------------------------------------
        # LOG FILE
        # --------------------------------------------------
        
        log_file = (

            Path(__file__)

            .resolve()

            .parents[2]

            / "services"
            / "semantic"
            / "v2"
            / "intent"
            / "logs"
            / "unknown_intents.jsonl"
        )
        
        # --------------------------------------------------
        # EXISTS
        # --------------------------------------------------

        if not log_file.exists():

            self.stdout.write("")

            self.stdout.write(
                "=" * 60
            )

            self.stdout.write(
                "UNKNOWN INTENT REPORT"
            )

            self.stdout.write(
                "=" * 60
            )

            self.stdout.write("")

            self.stdout.write(
                "No unknown intent log found."
            )

            self.stdout.write("")

            return

        # --------------------------------------------------
        # COUNT
        # --------------------------------------------------

        counter = Counter()

        total = 0

        with open(

            log_file,

            "r",

            encoding="utf-8",

        ) as fp:

            for line in fp:

                line = line.strip()

                if not line:
                    continue

                try:

                    row = json.loads(
                        line
                    )

                except Exception:

                    continue

                term = (

                    row.get(
                        "term"
                    )
                )

                if not term:
                    continue

                counter[
                    term
                ] += 1

                total += 1

        # --------------------------------------------------
        # REPORT
        # --------------------------------------------------

        self.stdout.write("")

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write(
            "UNKNOWN INTENT REPORT"
        )

        self.stdout.write(
            "=" * 60
        )

        self.stdout.write("")

        for term, count in (

            counter.most_common()
        ):

            self.stdout.write(

                f"{term:<40} {count}"
            )

        self.stdout.write("")

        self.stdout.write(
            "-" * 60
        )

        self.stdout.write(

            f"TOTAL UNKNOWN: {total}"
        )

        self.stdout.write(
            "-" * 60
        )

        self.stdout.write("")