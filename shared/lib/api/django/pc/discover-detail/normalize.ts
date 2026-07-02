// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover-detail/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Normalize
 * ============================================================================
 *
 * Responsibilities
 *
 * - Runtime Safety
 * - Null Protection
 * - Array Normalization
 *
 * NOT
 *
 * - Projection
 * - UI Logic
 * - Semantic Generation
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * ============================================================================
 */

import type {

    DiscoverDetailRuntime,

    DiscoverDetailAttribute,

    DiscoverDetailProduct,

    DiscoverDetailSiblingGroup,

} from './contracts'
/* ============================================================================
🔥 Normalize Runtime
============================================================================ */


export function normalizeDiscoverDetailRuntime(

    runtime: DiscoverDetailRuntime

): DiscoverDetailRuntime {

    return {

        ...runtime,

        meaning: {

            ...runtime.meaning,

        },

        presentation: {

            ...runtime.presentation,

        },

        seo: {

            ...runtime.seo,

        },


        data: {

            ...(runtime.data ?? {}),

            aliases:

                runtime.data?.aliases ?? [],

            related_groups:

                runtime.data?.related_groups ?? [],

            sibling_groups:

                (runtime.data?.sibling_groups ?? [])
                    .map(normalizeSiblingGroup),

            attribute:

                normalizeAttribute(
                    runtime.data?.attribute
                ),

            sample_products:

                (runtime.data?.sample_products ?? [])
                    .map(normalizeProduct),

        },

        raw:

            runtime.raw ?? runtime,

    }

}

/* ============================================================================
🔥 Normalize Attribute
============================================================================ */

function normalizeAttribute(

    attribute?: DiscoverDetailAttribute

): DiscoverDetailAttribute | undefined {

    if (!attribute) {

        return undefined

    }

    return {

        ...attribute,

    }

}

/* ============================================================================
🔥 Normalize Product
============================================================================ */

function normalizeProduct(

    product: DiscoverDetailProduct

): DiscoverDetailProduct {

    return {

        unique_id:

            product.unique_id,

        name:

            product.name,

        maker:

            product.maker ?? '',

        price:

            product.price ?? 0,

        image_url:

            product.image_url ?? '',

    }

}



/* ============================================================================
🔥 Normalize Sibling Group
============================================================================ */

function normalizeSiblingGroup(

    sibling: DiscoverDetailSiblingGroup

): DiscoverDetailSiblingGroup {

    return {

        group_slug:

            sibling.group_slug,

        group_name:

            sibling.group_name,

        presentation_name:

            sibling.presentation_name ?? '',

        presentation_description:

            sibling.presentation_description ?? '',

        icon:

            sibling.icon ?? '',

        color:

            sibling.color ?? '',

        sort_order:

            sibling.sort_order ?? '',

        is_current:

            sibling.is_current ?? false,

    }

}

/* ============================================================================
🔥 Alias
============================================================================ */

export const normalizeDiscoverDetail =
    normalizeDiscoverDetailRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverDetailRuntime