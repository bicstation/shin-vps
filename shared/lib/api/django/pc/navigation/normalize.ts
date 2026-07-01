// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/normalize.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Normalize V2
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Runtime
 *
 * ↓
 *
 * Runtime Contract
 *
 * IMPORTANT
 *
 * Normalize SHALL
 *
 * ✓ Preserve Backend Reality
 * ✓ Guarantee Runtime Contract
 * ✓ Fill Missing Collections
 * ✓ Preserve Raw Runtime
 *
 * Normalize SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Presentation
 * ✗ Generate Authority
 * ✗ Generate UI
 *
 * ============================================================================
 */

import type {

    NavigationRuntimeContract,

} from './contracts'

/* ============================================================================
🔥 Normalize Navigation Runtime
============================================================================ */

export function normalizeNavigation(

    runtime?: Partial<NavigationRuntimeContract>

): NavigationRuntimeContract {

    return {

        /* ====================================================================
        Status
        ==================================================================== */

        success:

            runtime?.success ?? true,

        /* ====================================================================
        Meaning
        ==================================================================== */

        meaning:

            runtime?.meaning,

        /* ====================================================================
        Presentation
        ==================================================================== */

        presentation:

            runtime?.presentation,

        /* ====================================================================
        SEO
        ==================================================================== */

        seo:

            runtime?.seo,

        /* ====================================================================
        Navigation
        ==================================================================== */

        intents:

            Array.isArray(runtime?.intents)

                ? runtime.intents

                : [],

        /* ====================================================================
        Authority
        ==================================================================== */

        semantic_schema_version:

            runtime?.semantic_schema_version,

        authority_version:

            runtime?.authority_version,

        semantic_authority:

            runtime?.semantic_authority,

        ready:

            runtime?.ready ?? false,

        /* ====================================================================
        Raw Backup
        ==================================================================== */

        raw:

            runtime,
    }

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeNavigation