// ============================================================================
// FILE:
// /shared/lib/api/django/pc/finder/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Normalize
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
 * - Runtime Projection
 * - Runtime Composition
 * - Semantic Authority
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Runtime Normalize
 *
 * ============================================================================
 */

import type {

    FinderRuntimeContract,

} from './contracts'

/* ============================================================================
🔥 Normalize Runtime
============================================================================ */

export function normalizeFinderRuntime(

    payload: any

): FinderRuntimeContract {

    if (!payload) {

        return createEmptyRuntime()

    }

    return {

        success:

            payload.success ?? true,

        /* --------------------------------------------------------------------
        Meaning
        -------------------------------------------------------------------- */

        meaning:

            payload.meaning ?? {},

        /* --------------------------------------------------------------------
        Presentation
        -------------------------------------------------------------------- */

        presentation:

            payload.presentation ?? {

                title: '',

                subtitle: '',

                description: '',

            },

        /* --------------------------------------------------------------------
        SEO
        -------------------------------------------------------------------- */

        seo:

            payload.seo ?? {},

        /* --------------------------------------------------------------------
        Data
        -------------------------------------------------------------------- */

        data: {

            query: {

                selected_groups:

                    payload.data?.query?.selected_groups ?? [],

                selected_attributes:

                    payload.data?.query?.selected_attributes ?? [],

                filters:

                    payload.data?.query?.filters ?? [],

                max_price:

                    payload.data?.query?.max_price ?? null,

                ...payload.data?.query,

            },

            summary: {

                group_count:

                    payload.data?.summary?.group_count ?? 0,

                attribute_count:

                    payload.data?.summary?.attribute_count ?? 0,

                filter_count:

                    payload.data?.summary?.filter_count ?? 0,

                result_count:

                    payload.data?.summary?.result_count ?? 0,

                has_result:

                    payload.data?.summary?.has_result ?? false,

            },

            products:

                Array.isArray(

                    payload.data?.products

                )

                    ? payload.data.products

                    : [],

        },

        /* --------------------------------------------------------------------
        Authority
        -------------------------------------------------------------------- */

        semantic_schema_version:

            payload.semantic_schema_version ?? 1,

        authority_version:

            payload.authority_version ?? 'unknown',

        semantic_authority:

            payload.semantic_authority ?? 'backend',

        ready:

            payload.ready ?? false,

        /* --------------------------------------------------------------------
        Raw Backup
        -------------------------------------------------------------------- */

        raw:

            payload,

    }

}

/* ============================================================================
🔥 Empty Runtime
============================================================================ */

function createEmptyRuntime(): FinderRuntimeContract {

    return {

        success: false,

        meaning: {},

        presentation: {

            title: '',

            subtitle: '',

            description: '',

        },

        seo: {},

        data: {

            query: {

                selected_groups: [],

                selected_attributes: [],

                filters: [],

                max_price: null,

            },

            summary: {

                group_count: 0,

                attribute_count: 0,

                filter_count: 0,

                result_count: 0,

                has_result: false,

            },

            products: [],

        },

        semantic_schema_version: 0,

        authority_version: 'empty',

        semantic_authority: 'none',

        ready: false,

        raw: null,

    }

}

/* ============================================================================
🔥 Alias
============================================================================ */

export const normalizeFinder =

    normalizeFinderRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeFinderRuntime