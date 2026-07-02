// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover-detail/projection.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Projection
 * ============================================================================
 *
 * Responsibilities
 *
 * - UI Projection
 *
 * NOT
 *
 * - Runtime Fetch
 * - Runtime Normalize
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

    DiscoverDetailRuntime,
    DiscoverDetailProduct,
    DiscoverDetailSiblingGroup,

} from './contracts'

/* ============================================================================
🔥 Projected Runtime
============================================================================ */

export interface ProjectedDiscoverDetailRuntime {

    header: {

        slug: string

        title: string

        subtitle: string

        description: string
    }

    group: {

        slug: string

        name: string

        presentationName: string

        presentationDescription: string

        type: string

        icon: string

        color: string

        productCount: number

        found: boolean
    }



    attribute: {

        slug: string

        name: string

        title: string

        description: string

        semanticRole: string

        semanticWeight: string

        rankingEnabled: boolean
    }

    aliases: string[]

    siblings: ProjectedSiblingGroup[]

    relatedGroups: string[]

    products: ProjectedProduct[]


}

/* ============================================================================
🔥 Projected Product
============================================================================ */

export interface ProjectedProduct {

    uniqueId: string

    name: string

    maker: string

    price: number

    image: string
}

/* ============================================================================
🔥 Projection
============================================================================ */

export function projectDiscoverDetailRuntime(

    runtime: DiscoverDetailRuntime

): ProjectedDiscoverDetailRuntime {

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

            productCount:

                runtime.data.product_count ?? 0,

            presentationName:

                runtime.data.presentation_name ?? '',

            presentationDescription:

                runtime.data.presentation_description ?? '',

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

            semanticRole:

                runtime.data.attribute?.semantic_role ?? '',

            semanticWeight:

                runtime.data.attribute?.semantic_weight ?? '',

            rankingEnabled:

                runtime.data.attribute?.is_ranking_enabled === 'TRUE',
        },

        aliases:

            runtime.data.aliases ?? [],

        relatedGroups:

            runtime.data.related_groups ?? [],

        products:

            (runtime.data.sample_products ?? []).map(

                projectProduct

            ),

        siblings:

            (runtime.data.sibling_groups ?? []).map(projectSiblingGroup),

    }
}

/* ============================================================================
🔥 Projected Sibling
============================================================================ */

export interface ProjectedSiblingGroup {

    slug: string

    name: string

    presentationName: string

    presentationDescription: string

    icon: string

    color: string

    isCurrent: boolean
}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(

    product: DiscoverDetailProduct

): ProjectedProduct {

    return {

        uniqueId:

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
🔥 Sibling Projection
============================================================================ */

function projectSiblingGroup(

    sibling: DiscoverDetailSiblingGroup

): ProjectedSiblingGroup {

    return {

        slug:

            sibling.group_slug,

        name:

            sibling.group_name,

        presentationName:

            sibling.presentation_name ?? '',

        presentationDescription:

            sibling.presentation_description ?? '',

        icon:

            sibling.icon ?? '',

        color:

            sibling.color ?? '',

        isCurrent:

            sibling.is_current ?? false,

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