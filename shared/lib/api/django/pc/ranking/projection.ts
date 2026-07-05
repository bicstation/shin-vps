// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Translate the Ranking Backend Contract into a lightweight
 * Frontend View Model.
 *
 * Backend Ranking Contract
 *      ↓
 * Projection
 *      ↓
 * Ranking View Model
 *
 * Projection Responsibilities
 *
 * ✓ Naming Translation
 * ✓ UI Translation
 * ✓ Lightweight View Model
 *
 * Projection SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Authority
 * ✗ Modify Backend Reality
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

import type {

    SemanticRankingRuntime,
    RankingProduct,
    RankingCategory,

} from './contracts'

/* ============================================================================
🔥 Ranking View Model
============================================================================ */

export interface ProjectedRankingRuntime {

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
🔥 Ranking Category View Model
============================================================================ */

export interface ProjectedRankingCategory {

    parentGroup: string

    presentationName: string

    groupCount: number

    groups: RankingCategory['groups']

}

/* ============================================================================
🔥 Ranking Product View Model
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
🔥 Projection
============================================================================ */

export function projectRankingRuntime(

    contract: SemanticRankingRuntime

): ProjectedRankingRuntime {

    return {

        header: {

            title:

                contract.presentation?.title ?? '',

            subtitle:

                contract.presentation?.subtitle ?? '',

            description:

                contract.presentation?.description ?? '',

        },

        stats: {

            productCount:

                contract.data.product_count,

            groupName:

                contract.data.group_name,

            groupSlug:

                contract.data.group_slug,

        },

        categories:

            (contract.categories ?? []).map(

                projectCategory

            ),

        products:

            (contract.data.products ?? []).map(

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

    /* ------------------------------------------------------------------------
    Variant
    ------------------------------------------------------------------------ */

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

    /* ------------------------------------------------------------------------
    Score
    ------------------------------------------------------------------------ */

    const score =

        product.semantic_score ?? 0

    /* ------------------------------------------------------------------------
    Emphasis
    ------------------------------------------------------------------------ */

    const emphasis =

        score >= 90

            ? 'high'

            : score >= 70

                ? 'medium'

                : 'low'

    /* ------------------------------------------------------------------------
    Badges
    ------------------------------------------------------------------------ */

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

    /* ------------------------------------------------------------------------
    Return View Model
    ------------------------------------------------------------------------ */

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
🔥 Legacy Compatibility
============================================================================ */

export const projectRanking =

    projectRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectRankingRuntime