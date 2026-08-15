# ============================================================================
# FILE:
# api/management/commands/inspect_observation.py
# ============================================================================
#
# SHIN CORE LINX
# Observation Runtime Inspection Command
#
# PURPOSE
#
# PCProduct
#      ↓
# maker
#      ↓
# observation_runtime
#      ↓
# Observation Structure Inspection
#
# USAGE
#
# python manage.py inspect_observation gmktec
# python manage.py inspect_observation gmktec --limit 5
# python manage.py inspect_observation gmktec --all
#
# IMPORTANT
#
# This command is READ ONLY.
#
# ✗ PCProductを変更しない
# ✗ Observation Realityを変更しない
# ✗ Semantic Meaningを生成しない
# ✗ Observationを変換しない
#
# ============================================================================

import json

from django.core.management.base import (
    BaseCommand,
    CommandError,
)

from django.db.models import (
    F,
    Value,
)

from django.db.models.functions import (
    Lower,
    Replace,
)

from api.models import PCProduct


class Command(BaseCommand):

    help = (
        'Inspect PCProduct Observation Runtime '
        'for a manufacturer.'
    )

    # ========================================================================
    # Arguments
    # ========================================================================

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            'maker',
            nargs='?',
            type=str,
            help='Manufacturer name, e.g. gmktec',
        )

        parser.add_argument(
            '--maker',
            dest='maker_option',
            type=str,
            help='Manufacturer name',
        )

        parser.add_argument(
            '--all',
            action='store_true',
            help='Inspect all products for the manufacturer.',
        )

        parser.add_argument(
            '--limit',
            type=int,
            default=1,
            help='Number of products to inspect. Default: 1.',
        )

    # ========================================================================
    # Handle
    # ========================================================================

    def handle(
        self,
        *args,
        **options,
    ):

        maker = (
            options.get('maker_option')
            or options.get('maker')
        )

        if not maker:

            raise CommandError(
                'Manufacturer is required. '
                'Example: python manage.py '
                'inspect_observation gmktec'
            )

        maker = maker.strip()

        if not maker:

            raise CommandError(
                'Manufacturer cannot be empty.'
            )

        # ====================================================================
        # Manufacturer Normalization
        # ====================================================================
        #
        # Inspection command only.
        #
        # This normalization does NOT modify PCProduct.maker.
        #
        # Examples:
        #
        #   OZ GAMING
        #   oz gaming
        #   OZGAMING
        #   ozgaming
        #
        # ↓
        #
        #   ozgaming
        #
        # ====================================================================

        normalized_maker = (
            maker
            .lower()
            .replace(
                ' ',
                ''
            )
        )

        # ====================================================================
        # Query
        # ====================================================================

        queryset = (
            PCProduct.objects
            .annotate(
                normalized_maker=Lower(
                    Replace(
                        F('maker'),
                        Value(' '),
                        Value(''),
                    )
                )
            )
            .filter(
                normalized_maker=normalized_maker
            )
            .order_by(
                'id'
            )
        )

        total_count = queryset.count()

        # ====================================================================
        # No Product
        # ====================================================================

        if total_count == 0:

            self.stdout.write('')

            self.stdout.write(
                self.style.WARNING(
                    'No PCProduct found.'
                )
            )

            self.stdout.write(
                f'maker : {maker}'
            )

            self.stdout.write(
                f'normalized : {normalized_maker}'
            )

            return

        # ====================================================================
        # Select Products
        # ====================================================================

        if options.get('all'):

            products = list(
                queryset
            )

        else:

            limit = options.get(
                'limit',
                1,
            )

            if (
                not isinstance(
                    limit,
                    int
                )
                or limit < 1
            ):

                limit = 1

            products = list(
                queryset[:limit]
            )

        # ====================================================================
        # Header
        # ====================================================================

        self.stdout.write('')

        self.stdout.write(
            '=' * 70
        )

        self.stdout.write(
            'OBSERVATION CHECK'
        )

        self.stdout.write(
            '=' * 70
        )

        self.stdout.write(
            f'MAKER      : {maker}'
        )

        self.stdout.write(
            f'NORMALIZED : {normalized_maker}'
        )

        self.stdout.write(
            f'PRODUCTS   : {total_count}'
        )

        self.stdout.write(
            f'INSPECTING : {len(products)}'
        )

        self.stdout.write(
            '=' * 70
        )

        # ====================================================================
        # Inspect
        # ====================================================================

        for index, product in enumerate(
            products,
            start=1,
        ):

            self.inspect_product(
                product,
                index,
                len(products),
            )

        # ====================================================================
        # Footer
        # ====================================================================

        self.stdout.write('')

        self.stdout.write(
            '=' * 70
        )

        self.stdout.write(
            'OBSERVATION INSPECTION COMPLETE'
        )

        self.stdout.write(
            '=' * 70
        )

    # ========================================================================
    # Inspect Product
    # ========================================================================

    def inspect_product(
        self,
        product,
        index,
        total,
    ):

        self.stdout.write('')

        self.stdout.write(
            '-' * 70
        )

        self.stdout.write(
            f'PRODUCT {index}/{total}'
        )

        self.stdout.write(
            '-' * 70
        )

        # ====================================================================
        # Identity
        # ====================================================================

        self.stdout.write(
            f'id         : {product.id}'
        )

        self.stdout.write(
            f'unique_id  : {product.unique_id}'
        )

        self.stdout.write(
            f'maker      : {product.maker}'
        )

        self.stdout.write(
            f'brand      : {product.brand}'
        )

        self.stdout.write(
            f'series     : {product.series}'
        )

        self.stdout.write(
            f'name       : {product.name}'
        )

        # ====================================================================
        # Runtime Type
        # ====================================================================

        self.stdout.write('')

        self.stdout.write(
            '-' * 70
        )

        self.stdout.write(
            'RUNTIME TYPE'
        )

        self.stdout.write(
            '-' * 70
        )

        raw_runtime = (
            product.observation_runtime
        )

        self.stdout.write(
            str(
                type(
                    raw_runtime
                )
            )
        )

        # ====================================================================
        # Parse
        # ====================================================================

        observation = (
            self.parse_runtime(
                raw_runtime
            )
        )

        if observation is None:

            self.stdout.write('')

            self.stdout.write(
                self.style.WARNING(
                    'Observation Runtime could not be parsed.'
                )
            )

            self.stdout.write(
                'RAW VALUE:'
            )

            self.stdout.write(
                str(
                    raw_runtime
                )
            )

            return

        # ====================================================================
        # Runtime Keys
        # ====================================================================

        if isinstance(
            observation,
            dict,
        ):

            self.stdout.write('')

            self.stdout.write(
                '-' * 70
            )

            self.stdout.write(
                'RUNTIME KEYS'
            )

            self.stdout.write(
                '-' * 70
            )

            for key in observation.keys():

                self.stdout.write(
                    f'- {key}'
                )

        # ====================================================================
        # Observation Runtime
        # ====================================================================

        self.stdout.write('')

        self.stdout.write(
            '-' * 70
        )

        self.stdout.write(
            'OBSERVATION RUNTIME'
        )

        self.stdout.write(
            '-' * 70
        )

        try:

            output = json.dumps(
                observation,
                ensure_ascii=False,
                indent=2,
            )

            self.stdout.write(
                output
            )

        except (
            TypeError,
            ValueError,
        ):

            self.stdout.write(
                str(
                    observation
                )
            )

        # ====================================================================
        # Structure Summary
        # ====================================================================

        self.print_structure_summary(
            observation
        )

    # ========================================================================
    # Parse Runtime
    # ========================================================================

    def parse_runtime(
        self,
        raw_runtime,
    ):

        if raw_runtime is None:

            return None

        # ====================================================================
        # Dict
        # ====================================================================

        if isinstance(
            raw_runtime,
            dict,
        ):

            return raw_runtime

        # ====================================================================
        # String
        # ====================================================================

        if isinstance(
            raw_runtime,
            str,
        ):

            value = raw_runtime.strip()

            if not value:

                return None

            try:

                return json.loads(
                    value
                )

            except (
                json.JSONDecodeError,
                TypeError,
                ValueError,
            ):

                return None

        # ====================================================================
        # Unsupported
        # ====================================================================

        return None

    # ========================================================================
    # Structure Summary
    # ========================================================================

    def print_structure_summary(
        self,
        observation,
    ):

        if not isinstance(
            observation,
            dict,
        ):

            return

        self.stdout.write('')

        self.stdout.write(
            '-' * 70
        )

        self.stdout.write(
            'STRUCTURE SUMMARY'
        )

        self.stdout.write(
            '-' * 70
        )

        for key, value in (
            observation.items()
        ):

            value_type = (
                type(
                    value
                ).__name__
            )

            # ---------------------------------------------------------------
            # List
            # ---------------------------------------------------------------

            if isinstance(
                value,
                list,
            ):

                self.stdout.write(
                    f'{key:<24} : '
                    f'list[{len(value)}]'
                )

                continue

            # ---------------------------------------------------------------
            # Dict
            # ---------------------------------------------------------------

            if isinstance(
                value,
                dict,
            ):

                self.stdout.write(
                    f'{key:<24} : '
                    f'dict[{len(value)}]'
                )

                continue

            # ---------------------------------------------------------------
            # String
            # ---------------------------------------------------------------

            if isinstance(
                value,
                str,
            ):

                preview = (
                    value
                    .replace(
                        '\n',
                        ' '
                    )
                    .strip()
                )

                if len(preview) > 80:

                    preview = (
                        preview[:80]
                        + '...'
                    )

                self.stdout.write(
                    f'{key:<24} : '
                    f'str -> {preview}'
                )

                continue

            # ---------------------------------------------------------------
            # Other
            # ---------------------------------------------------------------

            self.stdout.write(
                f'{key:<24} : '
                f'{value_type} -> {value}'
            )