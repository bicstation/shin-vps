// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Projection
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
 * - Runtime Composition
 * - Semantic Authority
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Runtime Projection Authority
 *
 * ============================================================================
 */

import type {

    SemanticRankingRuntime,
    RankingProduct,
    RankingCategory,

} from './contracts'

/* ============================================================================
🔥 Experience Runtime
============================================================================ */

export interface ProjectedRankingExperienceRuntime {

    header: {

        title: string

        subtitle: string

        description: string

    }

    stats: {

        productCount: number

        groupName: string

        groupSlug: string

    }

    categories: ProjectedRankingCategory[]

    products: ProjectedRankingProduct[]

}

/* ============================================================================
🔥 Projected Category
============================================================================ */

export interface ProjectedRankingCategory {

    parentGroup: string

    presentationName: string

    groupCount: number

    groups: RankingCategory['groups']

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

): ProjectedRankingExperienceRuntime {

    return {

        header: {

            title:

                runtime.presentation?.title ?? '',

            subtitle:

                runtime.presentation?.subtitle ?? '',

            description:

                runtime.presentation?.description ?? '',

        },

        stats: {

            productCount:

                runtime.data.product_count,

            groupName:

                runtime.data.group_name,

            groupSlug:

                runtime.data.group_slug,

        },

        categories:

            (runtime.categories ?? []).map(

                projectCategory

            ),

        products:

            (runtime.data.products ?? []).map(

                projectProduct

            ),

    }

}

/* ============================================================================
🔥 Category Projection
============================================================================ */

function projectCategory(

    category: RankingCategory

): ProjectedRankingCategory {

    return {

        parentGroup:

            category.parent_group,

        presentationName:

            category.presentation_name,

        groupCount:

            category.group_count,

        groups:

            category.groups,

    }

}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(

    product: RankingProduct

): ProjectedRankingProduct {

    const variant =

        product.semantic_attributes?.includes('usage-ai')

            ? 'ai'

            : product.semantic_attributes?.includes('usage-gaming')

                ? 'gaming'

                : product.semantic_attributes?.includes('usage-business')

                    ? 'business'

                    : product.semantic_attributes?.includes('usage-creator')

                        ? 'creator'

                        : 'general'

    const score =

        product.semantic_score ?? 0

    const emphasis =

        score >= 90

            ? 'high'

            : score >= 70

                ? 'medium'

                : 'low'

    const badges: string[] = []

    if (product.semantic_attributes?.includes('gpu-rtx-5090')) {

        badges.push('RTX 5090')

    }

    if (product.semantic_attributes?.includes('gpu-rtx-5080')) {

        badges.push('RTX 5080')

    }

    if (product.semantic_attributes?.includes('cpu-ai')) {

        badges.push('AI Ready')

    }

    return {

        id:

            product.product_id,

        name:

            product.name,

        maker:

            product.maker,

        price:

            product.price,

        image:

            product.image_url,

        score,

        badges,

        tags: [

            ...(product.workflow_tags ?? []),

            ...(product.semantic_labels ?? []).slice(

                0,

                2

            ),

        ],

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

export const projectRanking =

    projectRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectRankingRuntime