# -*- coding: utf-8 -*-

from collections import Counter
from django.core.management.base import BaseCommand
from api.models import (
    AdultProduct,
    AdultAttribute,
)


class Command(BaseCommand):

    help = "Runtime Coverage Audit"

    def add_arguments(self, parser):

        parser.add_argument(
            "--top",
            type=int,
            default=20,
        )

        parser.add_argument(
            "--explain",
            action="store_true",
        )

    def handle(self, *args, **options):

        top = options["top"]
        explain = options["explain"]

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write("RUNTIME AUDIT")
        self.stdout.write("=" * 60)

        # =================================================
        # PRODUCTS
        # =================================================

        total_products = (
            AdultProduct.objects.count()
        )

        with_attributes = (
            AdultProduct.objects
            .filter(
                has_attributes=True
            )
            .count()
        )

        without_attributes = (
            total_products -
            with_attributes
        )

        coverage = 0

        if total_products:

            coverage = round(
                (
                    with_attributes /
                    total_products
                ) * 100,
                2,
            )

        self.stdout.write("")
        self.stdout.write(
            f"Products           : {total_products}"
        )

        self.stdout.write(
            f"With Attributes    : {with_attributes}"
        )

        self.stdout.write(
            f"Without Attributes : {without_attributes}"
        )

        self.stdout.write(
            f"Coverage           : {coverage}%"
        )


        # print(
        #     list(
        #         AdultProduct.objects
        #         .values_list(
        #             "api_source",
        #             flat=True,
        #         )
        #         .distinct()
        #     )
        # )


        # =================================================
        # SOURCE COVERAGE
        # =================================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("SOURCE COVERAGE")
        self.stdout.write("-" * 60)

        # sources = (
        #     AdultProduct.objects
        #     .values_list(
        #         "api_source",
        #         flat=True,
        #     )
        #     .distinct()
        # )
        sources = set(
            AdultProduct.objects
            .values_list(
                "api_source",
                flat=True,
            )
        )

        for source in sources:

            source_total = (
                AdultProduct.objects
                .filter(
                    api_source=source,
                )
                .count()
            )

            source_mapped = (
                AdultProduct.objects
                .filter(
                    api_source=source,
                    has_attributes=True,
                )
                .count()
            )

            source_coverage = 0

            if source_total:

                source_coverage = round(
                    (
                        source_mapped /
                        source_total
                    ) * 100,
                    2,
                )

            self.stdout.write("")
            self.stdout.write(
                f"{source}"
            )

            self.stdout.write(
                f"  Products : {source_total}"
            )

            self.stdout.write(
                f"  Mapped   : {source_mapped}"
            )

            self.stdout.write(
                f"  Coverage : {source_coverage}%"
            )

        # =================================================
        # ATTRIBUTE STATS
        # =================================================

        attribute_stats = []

        for attr in AdultAttribute.objects.all():
            count = attr.products.count()
            attribute_stats.append(
                (
                    attr,
                    count,
                )
            )
        

        # =================================================
        # TOP ATTRIBUTES
        # =================================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("TOP ATTRIBUTES")
        self.stdout.write("-" * 60)

        
        ranking = [

            (
                attr.slug,
                count,
            )

            for attr, count
            in attribute_stats

        ]


        ranking.sort(
            key=lambda x: x[1],
            reverse=True,
        )

        for slug, count in ranking[:top]:

            self.stdout.write(
                f"{slug:<25} {count}"
            )

        print(
            "attribute_stats",
            len(attribute_stats)
        )

        print(
            "ranking",
            len(ranking)
        )

        # =================================================
        # ZERO ATTRIBUTES
        # =================================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("ZERO ATTRIBUTES")
        self.stdout.write("-" * 60)

        zero_count = 0
        
        # attribute_stats = []

        # for attr in AdultAttribute.objects.all():
        #     count = attr.products.count()
        #     attribute_stats.append(
        #         (
        #             attr,
        #             count,
        #         )
        #     )

        for attr, count in attribute_stats:

            if count == 0:
                zero_count += 1
                self.stdout.write(
                    attr.slug
                )

        if zero_count == 0:

            self.stdout.write(
                "No zero attributes"
            )        


        # =================================================
        # TOP GENRES
        # =================================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("TOP GENRES")
        self.stdout.write("-" * 60)

        genre_counter = Counter()

        products = (
            AdultProduct.objects
            .prefetch_related(
                "genres"
            )
        )

        for product in products:

            for genre in product.genres.all():

                genre_counter[
                    genre.name
                ] += 1

        for name, count in (
            genre_counter.most_common(top)
        ):

            self.stdout.write(
                f"{name:<25} {count}"
            )

        # =================================================
        # UNMAPPED GENRES
        # =================================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("TOP UNMAPPED GENRES")
        self.stdout.write("-" * 60)

        unmapped_counter = Counter()

        products = (
            AdultProduct.objects
            .filter(
                has_attributes=False
            )
            .prefetch_related(
                "genres"
            )
        )

        for product in products:

            for genre in product.genres.all():

                unmapped_counter[
                    genre.name
                ] += 1

        for name, count in (
            unmapped_counter.most_common(top)
        ):

            self.stdout.write(
                f"{name:<25} {count}"
            )
        
        # =================================================
        # SAMPLE UNMAPPED PRODUCTS
        # =================================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("SAMPLE UNMAPPED PRODUCTS")
        self.stdout.write("-" * 60)

        samples = (
            AdultProduct.objects
            .filter(
                has_attributes=False,
            )
            .prefetch_related(
                "genres"
            )[:10]
        )

        for product in samples:

            self.stdout.write("")

            self.stdout.write(
                f"[{product.id}]"
            )

            self.stdout.write(
                product.title
            )

            genres = [
                g.name
                for g in product.genres.all()
            ]

            self.stdout.write(
                f"Genres: {genres}"
            )
        
        # =================================================
        # EXPLAIN
        # =================================================

        if options["explain"]:

            # self.stdout.write("")
            # self.stdout.write("-" * 60)
            # self.stdout.write("TSV IMPROVEMENT CANDIDATES")
            # self.stdout.write("-" * 60)

            # for name, count in (
            #     unmapped_counter.most_common(top)
            # ):

            #     self.stdout.write(
            #         f"{name:<25} {count}"
            #     )

            # self.stdout.write("")
            # self.stdout.write(
            #     "Review semantic_aliases.tsv"
            # )

            # self.stdout.write(
            #     "Review semantic_normalization_rules.tsv"
            # )
            
            self.stdout.write("")
            self.stdout.write("-" * 60)
            self.stdout.write("UNMAPPED GENRE DETAILS")
            self.stdout.write("-" * 60)

            for genre_name, count in (
                unmapped_counter.most_common(20)
            ):

                self.stdout.write("")
                self.stdout.write(
                    f"{genre_name} ({count})"
                )

                sample = (
                    AdultProduct.objects
                    .filter(
                        has_attributes=False,
                        genres__name=genre_name,
                    )
                    .first()
                )

                if sample:

                    self.stdout.write(
                        f"Sample: {sample.title}"
                    )
            
            self.stdout.write("")
            self.stdout.write("-" * 60)
            self.stdout.write("TSV SUGGESTIONS")
            self.stdout.write("-" * 60)
            
            for genre_name, count in (
                unmapped_counter.most_common()
            ):
                
                if count < 100:
                    continue
                
                self.stdout.write(
                    f"{genre_name:<25} {count}"
                )

        # =================================================
        # HEALTH
        # =================================================

        self.stdout.write("")
        self.stdout.write("-" * 60)
        self.stdout.write("HEALTH")
        self.stdout.write("-" * 60)
        
        # zero_attributes = sum(
        #     1
        #     for attr in AdultAttribute.objects.all()
        #     if attr.products.count() == 0
        # )
        
        zero_attributes = sum(

            1

            for attr, count
            in attribute_stats
            if count == 0

        )
        
        if (
            coverage >= 80
            and zero_attributes == 0
            and without_attributes < 1000
        ):

            status = "EXCELLENT"

        elif coverage >= 60:

            status = "GOOD"

        elif coverage >= 40:

            status = "WARNING"

        else:

            status = "CRITICAL"


        self.stdout.write(
            f"Runtime Health : {status}"
        )

        self.stdout.write("")
        self.stdout.write("=" * 60)