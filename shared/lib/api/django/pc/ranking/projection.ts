// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Universe Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Translate the Ranking Backend Contract into the
 * Ranking Universe View Model.
 *
 * Backend Ranking Contract
 *      ↓
 * Projection
 *      ↓
 * Ranking Universe View Model
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
    RankingCategory,
} from './contracts'

/* ============================================================================
🔥 Ranking Universe View Model
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
🔥 Projection
============================================================================ */

export function projectRankingRuntime(

    contract: SemanticRankingRuntime,

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
                projectCategory,
            ),

    }

}

/* ============================================================================
🔥 Category Projection
============================================================================ */

function projectCategory(

    category: RankingCategory,

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
🔥 Default Export
============================================================================ */

export default projectRankingRuntime