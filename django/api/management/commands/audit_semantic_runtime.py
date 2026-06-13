from collections import Counter

from django.core.management.base import BaseCommand

from api.models import PCProduct


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        counter = Counter()

        for product in PCProduct.objects.all():

            runtime = product.semantic_runtime or {}

            schema = tuple(
                sorted(runtime.keys())
            )

            counter[schema] += 1

        for schema, count in sorted(
            counter.items(),
            key=lambda x: x[1],
            reverse=True,
        ):

            print()
            print(count)
            print(schema)