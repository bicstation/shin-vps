import traceback

from django.db.models import Q
from api.models.linkshare_products import ( LinkshareProduct, )
from api.services.feed.services.pc_import_service import ( PCImportService, )
from api.services.feed.constants.linkshare_mid_map import ( LINKSHARE_MID_MAP,)


class LinkshareImportService:

    def __init__(self):

        self.pc_import_service = (
            PCImportService()
        )

    def import_mid(

        self,
        mid,

    ):

        config = (
            LINKSHARE_MID_MAP.get(
                str(mid)
            )
        )

        if not config:

            raise ValueError(
                f"Unknown MID {mid}"
            )

        queryset = (

            LinkshareProduct.objects.filter(

                Q(
                    merchant_id=str(mid)
                )

                |

                Q(
                    merchant_id=str(
                        int(mid)
                    )
                ),

                is_active=True,

            )

        )

        created = 0
        updated = 0
        errors = 0

        for row in queryset.iterator():

            try:

                result = (

                    self.pc_import_service.import_product(

                        source=row,

                        maker=config[
                            "maker"
                        ],

                        prefix=config[
                            "prefix"
                        ],

                    )

                )

                if result["created"]:
                    created += 1
                else:
                    updated += 1
                
            except Exception as e:

                errors += 1

                print(
                    f"\nSKU={row.sku}"
                )

                traceback.print_exc()


        return {

            "total":
                queryset.count(),

            "created":
                created,

            "updated":
                updated,

            "errors":
                errors,

        }