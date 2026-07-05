// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert Backend Discover JSON into the
 * Canonical Discover Backend Contract.
 *
 * Backend Discover Runtime
 *      ↓
 * Contract Guarantee
 *      ↓
 * Discover Backend Contract
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

    DiscoverRuntimeContract,
    DiscoverData,
    DiscoverAttribute,
    DiscoverSiblingGroup,
    DiscoverSampleProduct,

} from './contracts'

/* ============================================================================
🔥 Normalize Discover
============================================================================ */

export function normalizeDiscover(

    runtime?: Partial<DiscoverRuntimeContract>

): DiscoverRuntimeContract {

    return {

        /* --------------------------------------------------------------------
        Backend Status
        -------------------------------------------------------------------- */

        found:

            runtime?.found ?? false,

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

    data?: Partial<DiscoverData>

): DiscoverData {

    return {

        group_slug:

            data?.group_slug ?? '',

        group_name:

            data?.group_name,

        presentation_name:

            data?.presentation_name,

        presentation_description:

            data?.presentation_description,

        type:

            data?.type,

        parent_group:

            data?.parent_group,

        icon:

            data?.icon,

        color:

            data?.color,

        sort_order:

            data?.sort_order,

        attribute:

            data?.attribute

                ? normalizeAttribute(

                    data.attribute

                )

                : undefined,

        product_count:

            data?.product_count,

        aliases:

            data?.aliases ?? [],

        sibling_groups:

            (data?.sibling_groups ?? []).map(

                normalizeSiblingGroup

            ),

        sample_products:

            (data?.sample_products ?? []).map(

                normalizeSampleProduct

            ),

    }

}

/* ============================================================================
🔥 Normalize Attribute
============================================================================ */

function normalizeAttribute(

    attribute: DiscoverAttribute

): DiscoverAttribute {

    return {

        ...attribute,

    }

}

/* ============================================================================
🔥 Normalize Sibling Group
============================================================================ */

function normalizeSiblingGroup(

    sibling: DiscoverSiblingGroup

): DiscoverSiblingGroup {

    return {

        ...sibling,

    }

}

/* ============================================================================
🔥 Normalize Sample Product
============================================================================ */

function normalizeSampleProduct(

    product: DiscoverSampleProduct

): DiscoverSampleProduct {

    return {

        ...product,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeDiscoverRuntime =

    normalizeDiscover

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscover