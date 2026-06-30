// ============================================================================
// Ranking Projection V2
// ============================================================================

import type {

    SemanticRankingRuntime,
    RankingProduct,

} from './contracts'

/* ============================================================================
🔥 Projection Runtime
============================================================================ */

export interface RankingProjectedRuntime {

    header: {

        title: string

        subtitle: string

        description: string
    }

    stats: {

        product_count: number

        group_name: string

        group_slug: string
    }

    products: ProjectedRankingProduct[]
}

/* ============================================================================
🔥 Projected Product
============================================================================ */

export interface ProjectedRankingProduct {

    id: number

    name: string

    maker: string

    price: number

    image: string

    score: number

    badges: string[]

    tags: string[]

    highlight?: {

        primary?: string

        secondary?: string
    }

    ui_state: {

        emphasis: 'high' | 'medium' | 'low'

        variant:
        | 'ai'
        | 'gaming'
        | 'creator'
        | 'business'
        | 'general'
    }
}

/* ============================================================================
🔥 Runtime Projection
============================================================================ */

export function projectRankingRuntime(

    runtime: SemanticRankingRuntime

): RankingProjectedRuntime {

    const products =

        runtime.data?.products ?? []

    return {

        /* --------------------------------------------------------------------
        Header
        -------------------------------------------------------------------- */

        header: {

            title:

                runtime.presentation?.title ?? '',

            subtitle:

                runtime.presentation?.subtitle ?? '',

            description:

                runtime.presentation?.description ?? '',
        },

        /* --------------------------------------------------------------------
        Stats
        -------------------------------------------------------------------- */

        stats: {

            product_count:

                runtime.data?.product_count ?? 0,

            group_name:

                runtime.data?.group_name ?? '',

            group_slug:

                runtime.data?.group_slug ?? '',
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

    p: RankingProduct

): ProjectedRankingProduct {

    /* ------------------------------------------------------------------------
    Variant
    ------------------------------------------------------------------------ */

    const variant =

        p.semantic_attributes?.includes('usage-ai')

            ? 'ai'

            : p.semantic_attributes?.includes('usage-gaming')

                ? 'gaming'

                : p.semantic_attributes?.includes('usage-business')

                    ? 'business'

                    : p.semantic_attributes?.includes('usage-creator')

                        ? 'creator'

                        : 'general'

    /* ------------------------------------------------------------------------
    Emphasis
    ------------------------------------------------------------------------ */

    const semanticScore =

        p.semantic_score ?? 0

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

        p.semantic_attributes?.includes(

            'gpu-rtx-5090'

        )

    ) {

        badges.push(

            'RTX 5090'

        )
    }

    if (

        p.semantic_attributes?.includes(

            'gpu-rtx-5080'

        )

    ) {

        badges.push(

            'RTX 5080'

        )
    }

    if (

        p.semantic_attributes?.includes(

            'cpu-ai'

        )

    ) {

        badges.push(

            'AI Ready'

        )
    }

    /* ------------------------------------------------------------------------
    Tags
    ------------------------------------------------------------------------ */

    const tags = [

        ...(p.workflow_tags ?? []),

        ...(p.semantic_labels ?? []).slice(

            0,

            2

        ),

    ]

    return {

        id:

            p.product_id,

        name:

            p.name,

        maker:

            p.maker,

        price:

            p.price,

        image:

            p.image_url,

        score:

            semanticScore,

        badges,

        tags,

        highlight: {

            primary:

                p.semantic_labels?.[0],

            secondary:

                p.semantic_labels?.[1],
        },

        ui_state: {

            emphasis,

            variant,
        },
    }
}