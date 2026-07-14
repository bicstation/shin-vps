// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Product Detail Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert Backend Product Detail JSON into the
 * Canonical Product Detail Backend Contract.
 *
 * Backend Product Detail Runtime
 *      ↓
 * Contract Guarantee
 *      ↓
 * Product Detail Backend Contract
 *
 * Normalize Responsibilities
 *
 * ✓ Preserve Backend Reality
 * ✓ Guarantee Contract Safety
 * ✓ Null Safety
 * ✓ Object Safety
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
 * Reality Authority
 *
 * ============================================================================
 */

import type {

    ProductDetailRuntimeContract,
    ProductDetailData,
    ProductDetail,
    CompiledRuntime,
    ProductSemanticRuntime,

} from './contracts'

/* ============================================================================
🔥 Normalize Product Detail
============================================================================ */

export function normalizeProductDetail(

    runtime?: Partial<ProductDetailRuntimeContract>

): ProductDetailRuntimeContract {

    return {

        /* --------------------------------------------------------------------
        Meaning
        -------------------------------------------------------------------- */

        meaning:

            runtime?.meaning,

        /* --------------------------------------------------------------------
        SEO
        -------------------------------------------------------------------- */

        seo:

            runtime?.seo,

        /* --------------------------------------------------------------------
        Data
        -------------------------------------------------------------------- */

        data:

            normalizeData(

                runtime?.data

            ),

        /* --------------------------------------------------------------------
        Authority
        -------------------------------------------------------------------- */

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

    data?: Partial<ProductDetailData>

): ProductDetailData {

    return {

        found:

            data?.found ?? false,

        product:

            normalizeProduct(

                data?.product

            ),

        compiled_runtime:

            normalizeCompiledRuntime(

                data?.compiled_runtime

            ),

        product_semantic_runtime:

            normalizeProductSemanticRuntime(

                data?.product_semantic_runtime

            ),

    }

}

/* ============================================================================
🔥 Normalize Product
============================================================================ */

function normalizeProduct(

    product?: Partial<ProductDetail>

): ProductDetail {

    return {

        unique_id:

            product?.unique_id ?? '',

        name:

            product?.name ?? '',

        ...product,

    }

}

/* ============================================================================
🔥 Normalize Compiled Runtime
============================================================================ */

function normalizeCompiledRuntime(

    runtime?: Partial<CompiledRuntime>

): CompiledRuntime {

    return {

        ...runtime,

    }

}

/* ============================================================================
🔥 Normalize Product Semantic Runtime
============================================================================ */

function normalizeProductSemanticRuntime(

    runtime?: Partial<ProductSemanticRuntime>

): ProductSemanticRuntime {

    return {

        ...runtime,

        grouped_attributes:

            runtime?.grouped_attributes ?? {},

        workflow_tags:

            runtime?.workflow_tags ?? [],

        semantic_labels:

            runtime?.semantic_labels ?? [],

        semantic_reasons:

            runtime?.semantic_reasons ?? [],

        related_intents:

            runtime?.related_intents ?? [],

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeProductDetailRuntime =

    normalizeProductDetail

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeProductDetail