// ============================================================================
// FILE:
// shared/lib/api/django/pc/ranking-detail/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert the Backend Ranking API into the
 * Canonical Ranking Backend Contract.
 *
 * Backend Ranking API
 *      ↓
 * Contract Guarantee
 *      ↓
 * Ranking Backend Contract
 *
 * Normalize Responsibilities
 *
 * ✓ Preserve Backend Reality
 * ✓ Guarantee Contract Safety
 * ✓ Null Safety
 * ✓ Array Safety
 *
 * Normalize SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Presentation
 * ✗ Generate Authority
 * ✗ Generate UI
 * ✗ Generate Runtime
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * ============================================================================
 */

import type {
    SemanticRankingRuntime,
    RankingData,
    RankingCategory,
    RankingProduct,
} from './contracts'

/* ============================================================================
🔥 Normalize Ranking
============================================================================ */

export function normalizeRankingRuntime(
    runtime?: Partial<SemanticRankingRuntime>
): SemanticRankingRuntime {

    return {
        success:
            runtime?.success ?? true,

        meaning:
            runtime?.meaning ?? {},

        presentation:
            runtime?.presentation ?? {},

        seo:
            runtime?.seo ?? {},

        categories:
            Array.isArray(runtime?.categories)
                ? runtime.categories.map(normalizeCategory)
                : [],

        data:
            normalizeData(runtime?.data),

        semantic_schema_version:
            runtime?.semantic_schema_version,

        authority_version:
            runtime?.authority_version,

        semantic_authority:
            runtime?.semantic_authority,

        ready:
            runtime?.ready ?? false,

        raw:
            runtime?.raw ?? runtime,
    }
}

/* ============================================================================
🔥 Normalize Category
============================================================================ */

function normalizeCategory(
    category: RankingCategory
): RankingCategory {

    return {
        ...category,
        groups:
            Array.isArray(category.groups)
                ? category.groups
                : [],
    }
}

/* ============================================================================
🔥 Normalize Data
============================================================================ */

function normalizeData(
    data?: Partial<RankingData>
): RankingData {

    return {
        group_slug:
            data?.group_slug ?? '',

        group_name:
            data?.group_name ?? '',

        product_count:
            data?.product_count ?? 0,

        products:
            Array.isArray(data?.products)
                ? data.products.map(normalizeProduct)
                : [],
    }
}

/* ============================================================================
🔥 Normalize Product
============================================================================ */

function normalizeProduct(
    product: RankingProduct
): RankingProduct {

    return {
        ...product,

        unique_id:
            product.unique_id ?? '',

        name:
            product.name ?? '',

        maker:
            product.maker ?? '',

        brand:
            product.brand ?? undefined,

        price:
            product.price ?? 0,

        image_url:
            product.image_url ?? '',

        cpu_model:
            product.cpu_model ?? undefined,

        gpu_model:
            product.gpu_model ?? undefined,

        memory_gb:
            product.memory_gb ?? undefined,

        storage_gb:
            product.storage_gb ?? undefined,

        display_info:
            product.display_info ?? undefined,

        semantic_attributes:
            Array.isArray(product.semantic_attributes)
                ? product.semantic_attributes
                : [],

        matched_groups:
            Array.isArray(product.matched_groups)
                ? product.matched_groups
                : [],

        semantic_labels:
            Array.isArray(product.semantic_labels)
                ? product.semantic_labels
                : [],

        workflow_tags:
            Array.isArray(product.workflow_tags)
                ? product.workflow_tags
                : [],
    }
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeRanking =
    normalizeRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeRankingRuntime