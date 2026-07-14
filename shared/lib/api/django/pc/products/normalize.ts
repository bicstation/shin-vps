// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Products Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert Backend Products JSON into the
 * Canonical Products Backend Contract.
 *
 * Backend Products Runtime
 *      ↓
 * Contract Guarantee
 *      ↓
 * Products Backend Contract
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
 * Reality Authority
 *
 * ============================================================================
 */

import type {

    ProductsRuntimeContract,
    ProductsData,
    PCProductItem,

} from './contracts'

/* ============================================================================
🔥 Normalize Products
============================================================================ */

export function normalizeProducts(

    runtime?: Partial<ProductsRuntimeContract>

): ProductsRuntimeContract {

    return {

        /* --------------------------------------------------------------------
        Meaning
        -------------------------------------------------------------------- */

        meaning:

            runtime?.meaning,

        /* --------------------------------------------------------------------
        Presentation
        -------------------------------------------------------------------- */

        presentation:

            runtime?.presentation,

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

    data?: Partial<ProductsData>

): ProductsData {

    return {

        count:

            data?.count ?? 0,

        page:

            data?.page ?? 1,

        page_size:

            data?.page_size ?? 20,

        sort:

            data?.sort ?? 'new',

        has_next:

            data?.has_next ?? false,

        products:

            (data?.products ?? []).map(

                normalizeProduct

            ),

    }

}

/* ============================================================================
🔥 Normalize Product
============================================================================ */

function normalizeProduct(

    product: PCProductItem

): PCProductItem {

    return {

        ...product,

        grouped_attributes:

            product.grouped_attributes ?? {},

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeProductsRuntime =

    normalizeProducts

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeProducts