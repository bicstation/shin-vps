// ============================================================================
// FILE:
// /shared/lib/api/django/pc/finder/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Projection
 * ============================================================================
 *
 * Responsibilities
 *
 * - Runtime Projection
 * - UI Projection
 *
 * NOT
 *
 * - Runtime Fetch
 * - Runtime Normalize
 * - Runtime Composition
 * - Semantic Authority
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Projection Authority
 *
 * ============================================================================
 */

import type {

    FinderRuntimeContract,
    FinderProductContract,

} from './contracts'

/* ============================================================================
🔥 Projected Runtime
============================================================================ */

export interface ProjectedFinderRuntime {

    header: {

        title: string

        subtitle: string

        description: string

    }

    stats: {

        result_count: number

        group_count: number

        has_result: boolean

    }

    filters: {

        groups: string[]

        max_price: number | null

    }

    products: ProjectedProduct[]

}

/* ============================================================================
🔥 Projected Product
============================================================================ */

export interface ProjectedProduct {

    id: number

    unique_id: string

    name: string

    maker: string

    price: number

    image: string

    badges: string[]

    tags: string[]

    score: number

    highlight?: {

        primary?: string

        secondary?: string

    }

    ui_state: {

        emphasis: 'high' | 'medium' | 'low'

        variant: 'ai' | 'gaming' | 'business' | 'creator' | 'general'

    }

}


/* ============================================================================
🔥 Projection
============================================================================ */

export function projectFinderRuntime(

    runtime: FinderRuntimeContract

): ProjectedFinderRuntime {

    const products =

        runtime.data?.products ?? []

    return {

        /* --------------------------------------------------------------------
        Header
        -------------------------------------------------------------------- */

        header: {

            title:

                runtime.presentation?.title ?? 'Finder',

            subtitle:

                runtime.presentation?.subtitle ?? '',

            description:

                runtime.presentation?.description ?? '',

        },

        /* --------------------------------------------------------------------
        Stats
        -------------------------------------------------------------------- */

        stats: {

            result_count:

                runtime.data?.summary?.result_count ?? 0,

            group_count:

                runtime.data?.summary?.group_count ?? 0,

            has_result:

                runtime.data?.summary?.has_result ?? false,

        },

        /* --------------------------------------------------------------------
        Filters
        -------------------------------------------------------------------- */

        filters: {

            groups:

                runtime.data?.query?.selected_groups ?? [],

            max_price:

                runtime.data?.query?.max_price ?? null,

        },

        /* --------------------------------------------------------------------
        Products
        -------------------------------------------------------------------- */

        products:

            products.map(

                projectProduct

            ),

    }

}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(

    product: FinderProductContract

): ProjectedProduct {

    /* ------------------------------------------------------------------------
    UI Variant
    ------------------------------------------------------------------------ */

    const variant =

        product.semantic_attributes?.includes(

            'usage-ai'

        )

            ? 'ai'

            : product.semantic_attributes?.includes(

                'usage-gaming'

            )

                ? 'gaming'

                : product.semantic_attributes?.includes(

                    'usage-business'

                )

                    ? 'business'

                    : product.semantic_attributes?.includes(

                        'usage-creator'

                    )

                        ? 'creator'

                        : 'general'

    /* ------------------------------------------------------------------------
    Emphasis
    ------------------------------------------------------------------------ */

    const semanticScore =

        product.semantic_score ?? 0

    const emphasis =

        semanticScore >= 90

            ? 'high'

            : semanticScore >= 70

                ? 'medium'

                : 'low'

    /* ------------------------------------------------------------------------
    Badges
    ------------------------------------------------------------------------ */

    const badges: string[] = []

    if (

        product.semantic_attributes?.includes(

            'gpu-rtx-5080'

        )

    ) {

        badges.push(

            'High-End GPU'

        )

    }

    if (

        product.semantic_attributes?.includes(

            'cpu-ai'

        )

    ) {

        badges.push(

            'AI Ready'

        )

    }

    if (

        product.semantic_attributes?.includes(

            'ssd-2tb-plus'

        )

    ) {

        badges.push(

            'Large Storage'

        )

    }

    /* ------------------------------------------------------------------------
    Tags
    ------------------------------------------------------------------------ */

    const tags = [

        ...(product.workflow_tags ?? []),

        ...(product.semantic_labels ?? []).slice(

            0,

            2

        ),

    ]

    return {

        id:

            product.product_id,

        unique_id:

            product.unique_id,

        name:

            product.name,

        maker:

            product.maker,

        price:

            product.price,

        image:

            product.image_url,

        badges,

        tags,

        score:

            product.semantic_score ?? 0,

        highlight: {

            primary:

                product.semantic_labels?.[0],

            secondary:

                product.semantic_labels?.[1],

        },

        ui_state: {

            emphasis,

            variant,

        },

    }


}

/* ============================================================================
🔥 Alias
============================================================================ */

export const projectFinder =

    projectFinderRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectFinderRuntime