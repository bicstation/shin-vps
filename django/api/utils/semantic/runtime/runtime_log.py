# =========================================================
# FILE:
# api/utils/semantic/runtime/runtime_log.py
# =========================================================

import pprint


# =========================================================
# RUNTIME LOG
# =========================================================

def runtime_log(

    enabled,

    title,

    payload=None,

):

    if not enabled:

        return

    # =====================================================
    # HEADER
    # =====================================================

    print()

    print(
        "=" * 56
    )

    print(
        f"{title}"
    )

    print(
        "=" * 56
    )

    # =====================================================
    # PAYLOAD
    # =====================================================

    if payload is not None:

        if isinstance(

            payload,

            (
                dict,
                list,
                tuple,
                set,
            ),

        ):

            pprint.pprint(
                payload,
                sort_dicts=False,
            )

        else:

            print(payload)