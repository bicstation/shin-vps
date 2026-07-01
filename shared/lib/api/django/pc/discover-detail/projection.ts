// ============================================================================
// Discover Detail Projection V2
// ============================================================================

import type {

    DiscoverDetailRuntime,
    DiscoverDetailSampleProduct,

} from './contracts'

/* ============================================================================
🔥 Projection Runtime
============================================================================ */

export interface DiscoverDetailProjectedRuntime {

    header: {

        slug: string

        title: string

        subtitle: string

        description: string
    }

    group: {

        slug: string

        name: string

        type: string

        icon: string

        color: string

        product_count: number

        found: boolean
    }

    attribute: {

        slug: string

        name: string

        title: string

        description: string

        semantic_role: string

        semantic_weight: string

        ranking_enabled: boolean
    }

    aliases: string[]

    related_groups: string[]

    sample_products: ProjectedProduct[]
}

/* ============================================================================
🔥 Projected Product
============================================================================ */

export interface ProjectedProduct {

    unique_id: string

    name: string

    maker: string

    price: number

    image: string
}

/* ============================================================================
🔥 Main Projection
============================================================================ */

export function projectDiscoverDetailRuntime(

    runtime: DiscoverDetailRuntime

): DiscoverDetailProjectedRuntime {

    return {

        header: {

            slug:
                runtime.presentation?.slug ?? '',

            title:
                runtime.presentation?.title ?? '',

            subtitle:
                runtime.presentation?.subtitle ?? '',

            description:
                runtime.presentation?.description ?? '',
        },

        group: {

            slug:
                runtime.data.group_slug,

            name:
                runtime.data.group_name ?? '',

            type:
                runtime.data.type ?? '',

            icon:
                runtime.data.icon ?? '',

            color:
                runtime.data.color ?? '',

            product_count:
                runtime.data.product_count ?? 0,

            found:
                runtime.found,
        },

        attribute: {

            slug:
                runtime.data.attribute?.slug ?? '',

            name:
                runtime.data.attribute?.name ?? '',

            title:
                runtime.data.attribute?.title ?? '',

            description:
                runtime.data.attribute?.description ?? '',

            semantic_role:
                runtime.data.attribute?.semantic_role ?? '',

            semantic_weight:
                runtime.data.attribute?.semantic_weight ?? '',

            ranking_enabled:

                runtime.data.attribute?.is_ranking_enabled === 'TRUE'
        },

        aliases:

            runtime.data.aliases ?? [],

        related_groups:

            runtime.data.related_groups ?? [],

        sample_products:

            (runtime.data.sample_products ?? []).map(

                projectProduct

            ),
    }
}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(

    product: DiscoverDetailSampleProduct

): ProjectedProduct {

    return {

        unique_id:
            product.unique_id,

        name:
            product.name,

        maker:
            product.maker ?? '',

        price:
            product.price ?? 0,

        image:
            product.image_url ?? '',
    }
}

/* ============================================================================
🔥 Alias
============================================================================ */

export const projectDiscoverDetail =
    projectDiscoverDetailRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectDiscoverDetailRuntime