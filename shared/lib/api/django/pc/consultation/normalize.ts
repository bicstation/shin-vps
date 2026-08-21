// ============================================================================
// FILE:
// /shared/lib/api/django/pc/consultation/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * PC Consultation Runtime Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Consultation Runtime
 *      ↓
 * Stable Consultation Runtime Contract
 *
 * Responsibilities
 *
 * ✓ Null Safety
 * ✓ Array Safety
 * ✓ Contract Safety
 * ✓ Preserve Backend Reality
 *
 * SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Requirements
 * ✗ Modify Semantic Groups
 * ✗ Rebuild Finder
 * ✗ Optimize Products
 *
 * ============================================================================
 */

import type {

    ConsultationRuntimeContract,
    ConsultationData,
    ConsultationQuery,
    ConsultationSummary,
    ConsultationProduct,

} from './contracts'

/* ============================================================================
🔥 Normalize Consultation Runtime
============================================================================ */

export function normalizeConsultationRuntime(

    runtime?: Partial<ConsultationRuntimeContract>,

): ConsultationRuntimeContract {

    return {

        meaning:
            runtime?.meaning,

        presentation:
            runtime?.presentation,

        seo:
            runtime?.seo,

        data:
            normalizeData(
                runtime?.data
            ),

        semantic_schema_version:
            runtime?.semantic_schema_version,

        authority_version:
            runtime?.authority_version,

        semantic_authority:
            runtime?.semantic_authority,

        ready:
            runtime?.ready ?? false,

    }

}

/* ============================================================================
🔥 Normalize Data
============================================================================ */

function normalizeData(

    data?: Partial<ConsultationData>,

): ConsultationData {

    return {

        query:
            normalizeQuery(
                data?.query
            ),

        summary:
            normalizeSummary(
                data?.summary
            ),

        products:

            Array.isArray(
                data?.products
            )

                ? data.products.map(
                    normalizeProduct
                )

                : [],

    }

}

/* ============================================================================
🔥 Normalize Query
============================================================================ */

function normalizeQuery(

    query?: Partial<ConsultationQuery>,

): ConsultationQuery {

    return {

        ...(query ?? {}),

        selected_groups:

            Array.isArray(
                query?.selected_groups
            )

                ? query.selected_groups

                : [],

        selected_attributes:

            Array.isArray(
                query?.selected_attributes
            )

                ? query.selected_attributes

                : [],

        filters:

            Array.isArray(
                query?.filters
            )

                ? query.filters

                : [],

        max_price:

            query?.max_price ?? null,

    }

}

/* ============================================================================
🔥 Normalize Summary
============================================================================ */

function normalizeSummary(

    summary?: Partial<ConsultationSummary>,

): ConsultationSummary {

    return {

        group_count:
            summary?.group_count ?? 0,

        attribute_count:
            summary?.attribute_count ?? 0,

        filter_count:
            summary?.filter_count ?? 0,

        result_count:
            summary?.result_count ?? 0,

        has_result:
            summary?.has_result ?? false,

    }

}

/* ============================================================================
🔥 Normalize Product
============================================================================ */

function normalizeProduct(

    product: ConsultationProduct,

): ConsultationProduct {

    return {

        ...product,

        semantic_attributes:

            Array.isArray(
                product.semantic_attributes
            )

                ? product.semantic_attributes

                : [],

        matched_groups:

            Array.isArray(
                product.matched_groups
            )

                ? product.matched_groups

                : [],

        workflow_tags:

            Array.isArray(
                product.workflow_tags
            )

                ? product.workflow_tags

                : [],

        workflows:

            Array.isArray(
                product.workflows
            )

                ? product.workflows

                : [],

        semantic_labels:

            Array.isArray(
                product.semantic_labels
            )

                ? product.semantic_labels

                : [],

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeConsultation =

    normalizeConsultationRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeConsultationRuntime