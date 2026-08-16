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
 * Safely normalize the Backend Product Detail Runtime
 * without removing or generating Backend information.
 *
 * Backend remains:
 *
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * IMPORTANT
 *
 * Normalize SHALL preserve Backend Runtime information.
 *
 * It may provide safe defaults only where required by
 * the TypeScript Contract.
 *
 * Normalize SHALL NOT:
 *
 * ✗ Generate Meaning
 * ✗ Generate Semantic Meaning
 * ✗ Generate Runtime
 * ✗ Generate UI
 * ✗ Remove Backend Runtime information
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
    runtime?: Partial<ProductDetailRuntimeContract>,
): ProductDetailRuntimeContract {

    return {

        meaning:
            runtime?.meaning,

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
    data?: Partial<ProductDetailData>,
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
    product?: Partial<ProductDetail>,
): ProductDetail {

    return {

        ...product,

        /* --------------------------------------------------------------------
        Required Identity
        -------------------------------------------------------------------- */

        unique_id:
            product?.unique_id ?? '',

        name:
            product?.name ?? '',

        /* --------------------------------------------------------------------
        Navigation
        -------------------------------------------------------------------- */

        breadcrumbs:
            product?.breadcrumbs ?? [],

    }

}

/* ============================================================================
🔥 Normalize Compiled Runtime
============================================================================ */

function normalizeCompiledRuntime(
    runtime?: Partial<CompiledRuntime>,
): CompiledRuntime | undefined {

    if (!runtime) {

        return undefined

    }

    return {

        ...runtime,

    }

}

/* ============================================================================
🔥 Normalize Product Semantic Runtime
============================================================================ */

function normalizeProductSemanticRuntime(
    runtime?: Partial<ProductSemanticRuntime>,
): ProductSemanticRuntime | undefined {

    if (!runtime) {

        return undefined

    }

    return {

        ...runtime,

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